import {Injectable} from '@nestjs/common';
import Jimp = require('jimp');
import Cache from '../cache/cache.decorator';
import {CacheType} from '../cache/enums/cache-type.enum';
import {Gw2ApiService} from '../gw2api/gw2-api.service';
import IColor from '../gw2api/interfaces/color.interface';

@Injectable()
export class EmblemPngService {

    public constructor(private readonly gw2ApiService: Gw2ApiService) {
    }

    @Cache({cacheType: CacheType.S3Cache})
    public async getEmblem(guildId): Promise<any> {
        const guild = await this.gw2ApiService.getGuild(guildId);
        if (!guild.emblem) {
            return '';
        }
        const foreground = await this.getForeground(guild);
        const background = await this.getBackground(guild);
        return await this.draw(background, foreground);
    }

    private async draw(background, foreground) {
        return new Promise(async (resolve) => {
            let image: Jimp = await this.drawBackground(background);
            image = await this.drawForeground(foreground, image);
            image.getBuffer('image/png', (e, buff) => {
                resolve(buff);
            });
        });
    }

    private async drawBackground(background): Promise<Jimp> {
        return new Promise<Jimp>(async (resolve) => {
            const [images, colors, flipHorizontal, flipVertical]: [string[], IColor[], boolean, boolean] = background;
            const img = await EmblemPngService.readImageResource(images[0]);
            img.mirror(flipHorizontal, flipVertical);
            resolve(EmblemPngService.colorize(img, colors[0]));
        });
    }

    private async drawForeground(def, image: Jimp): Promise<Jimp> {
        return new Promise<Jimp>(async (resolve) => {
            const [images, colors, flipHorizontal, flipVertical]: [string[], IColor[], boolean, boolean] = def;
            images.reverse();
            const img = await EmblemPngService.drawImage(image, images, colors);
            img.mirror(flipHorizontal, flipVertical);
            resolve(img);
        });
    }

    private static async drawImage(composed: Jimp, images: string[], colors: IColor[], count: number = 0): Promise<Jimp> {
        return new Promise<Jimp>(async (resolve) => {
            const image = images.pop();
            if (image) {
                const imagePart = await EmblemPngService.readImageResource(image);
                const color = colors[count === 1 ? 0 : 1];
                composed.composite(EmblemPngService.colorize(imagePart, color), 0, 0, {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacityDest: 1,
                    opacitySource: 1
                }, () => {
                    resolve(this.drawImage(composed, images, colors, ++count));
                });
            } else {
                resolve(composed);
            }
        });
    }

    private static colorize(image: Jimp, color: IColor) {
        const base = color.cloth;
        return image.clone()
            .greyscale((err, value) => value.color([
                {apply: 'mix', params: [EmblemPngService.translateColor(base.rgb), 100]}
            ]));
    }

    private static async readImageResource(imgFile) {
        const PATH = './emblems/';
        return await Jimp.read(PATH + imgFile);
    }

    private async getForeground(guild) {
        const foregrounds = await this.gw2ApiService.getEmblemForegrounds();
        return this.getConfig(guild, foregrounds, guild.emblem.foreground,
            'FlipForegroundHorizontal', 'FlipForegroundVertical');
    }

    private async getBackground(guild) {
        const backgrounds = await this.gw2ApiService.getEmblemBackgrounds();
        return this.getConfig(guild, backgrounds, guild.emblem.background,
            'FlipBackgroundHorizontal', 'FlipBackgroundVertical');
    }

    private async getConfig(guild, res, def, horFlag, verFlag) {
        const fgDef = res.find((fg) => fg.id === def.id);
        const files: string[] = fgDef.layers.map((u) => u.substring(u.lastIndexOf('/') + 1, u.length));

        const flags = guild.emblem.flags;
        const flipHorizontal: boolean = flags.includes(horFlag);
        const flipVertical: boolean = flags.includes(verFlag);

        const colors = await this.gw2ApiService.getColors();
        const emblemColors: IColor[] = def.colors.map((color: number) => (colors.find((c: IColor) => c.id === color)));

        return [files, emblemColors, flipHorizontal, flipVertical];
    }

    private static translateColor(color) {
        return '#' + EmblemPngService.pad(color[0]) + EmblemPngService.pad(color[1]) + EmblemPngService.pad(color[2]);
    }

    private static pad(color: number, width: number = 2, z: string = '0') {
        const n = color.toString(16);
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
}
