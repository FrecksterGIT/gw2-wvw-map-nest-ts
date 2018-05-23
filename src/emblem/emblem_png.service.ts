import {Injectable} from '@nestjs/common';
import Jimp = require('jimp');
import {Gw2ApiService} from '../gw2api/gw2-api.service';

@Injectable()
export class EmblemPngService {

  public constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getEmblem(guildId): Promise<any> {
    const guild = await this.gw2ApiService.getGuild(guildId);

    // const backgrounds = await this.gw2ApiService.getEmblemBackgrounds();
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
      const [images, colors, flipHorizontal, flipVertical] = background;
      const img = await EmblemPngService.readImageResource(images[0]);
      img.color([{
        apply: 'mix', params: [colors[0], 100]
      }]);
      resolve(img);
    });
  }

  private async drawForeground(def, image: Jimp, opacity = .7): Promise<Jimp> {
    return new Promise<Jimp>(async (resolve) => {
      const [images, colors, flipHorizontal, flipVertical] = def;
      const img = await EmblemPngService.drawImage(image, images, colors[1]);
      resolve(img);
    });
  }

  private static async drawImage(composed: Jimp, images: string[], color: string): Promise<Jimp> {
    return new Promise<Jimp>(async (resolve) => {
      const image = images.pop();
      if (image) {
        const imagePart = await EmblemPngService.readImageResource(image);
        imagePart.color([
          {apply: 'greyscale', params: [0]},
          {apply: 'mix', params: [color, 75]}
        ]);
        composed.composite(imagePart, 0, 0);
        resolve(this.drawImage(composed, images, color));
      } else {
        resolve(composed);
      }
    });
  }

  private static async readImageResource(imgFile) {
    const PATH = './src/assets/emblem_base/';
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
    const emblemColors = def.colors.map((color) => (colors.find((c) => c.id === color).cloth.rgb));

    return [files, EmblemPngService.translateColors(emblemColors), flipHorizontal, flipVertical];
  }

  private static translateColors(colors) {
    return colors.map((color) => '#' + color[0].toString(16) + color[1].toString(16) + color[2].toString(16));
  }

}
