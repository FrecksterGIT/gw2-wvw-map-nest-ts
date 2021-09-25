import {Injectable, Logger} from '@nestjs/common';
import {Gw2ApiService} from '../gw2api/gw2-api.service';

import {IGuild} from '../gw2api/interfaces/guild.interface';
import backgroundDefs from './data/defs.background';
import color2Defs from './data/defs.color2';
import foregroundDefs from './data/defs.foreground';

// tslint:disable-next-line:no-var-requires
const {createSVGWindow} = require('svgdom');
// tslint:disable-next-line:no-var-requires
const {SVG, registerWindow, Container, G} = require('@svgdotjs/svg.js');

const window = createSVGWindow();
const document = window.document;

registerWindow(window, document);

@Injectable()
export class EmblemService {

  public constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getEmblem(guildId): Promise<string> {
    const guild = await this.gw2ApiService.getGuild(guildId);
    document.documentElement.innerHTML = '';
    const draw = new SVG(document.documentElement).size(256, 256);
    if (guild.emblem && guild.emblem.background && guild.emblem.background.id) {
      try {
        this.drawBackground(draw, guild);
      } catch {
        Logger.log('failed drawing emblem background for ' + guildId, 'EmblemService');
      }
      try {
        this.drawForeground(draw, guild);
      } catch {
        Logger.log('failed drawing emblem foreground for ' + guildId, 'EmblemService');
      }
    }
    return draw.svg();
  }

  private drawBackground(draw: typeof Container, guild: IGuild): boolean {
    const def = backgroundDefs[guild.emblem.background.id];
    if (!def) {
      return false;
    }
    const matrix: string = EmblemService.getBackgroundMatrix(guild.emblem.flags, def.size);
    const color: string = EmblemService.getColor(guild.emblem.background.colors[0]);
    const group: typeof G = draw.group();
    group.attr('transform', matrix);
    this.add(group, def.p, color, .7);
    return true;
  }

  private drawForeground(draw: typeof Container, guild: IGuild): boolean {
    const def = foregroundDefs[guild.emblem.foreground.id];
    if (!def) {
      return false;
    }
    const matrix: string = EmblemService.getForegroundMatrix(guild.emblem.flags, def.size);
    const color1: string = EmblemService.getColor(guild.emblem.foreground.colors[0]);
    const color2: string = EmblemService.getColor(guild.emblem.foreground.colors[1]);
    const group: typeof G = draw.group();
    group.attr('transform', matrix);
    this.add(group, def.p2, color1, 1);
    this.add(group, def.p1, color2, 1);
    this.add(group, def.pt1, color1, .3);
    this.add(group, def.pto2, '#000', .3);
    return true;
  }

  private add(draw: typeof G, def, color: string, opacity): void {
    if (!def) {
      return;
    }
    const group: typeof G = draw.group();
    group.attr('fill', color);
    group.attr('stroke', color);
    group.attr('stroke-opacity', '50%');
    group.attr('stroke-width', '.05%');
    group.attr('opacity', opacity);
    def.forEach((path) => {
      group.path(path);
    });
  }

  private static getColor(color: number): string {
    const col = color2Defs.find((cDef) => cDef.id === color);
    if (col) {
      return 'rgb(' + col.cloth.rgb.join(',') + ')';
    }
    return '#fff';
  }

  private static getBackgroundMatrix(flags: string[] = [], size: number = 256): string {
    const matrix: number[] = [1, 0, 0, 1, 0, 0];
    matrix[0] = 256 / size;
    matrix[3] = 256 / size;
    if (flags.includes('FlipBackgroundHorizontal')) {
      matrix[0] = -matrix[0];
      matrix[4] = 256;
    }
    if (flags.includes('FlipBackgroundVertical')) {
      matrix[3] = -matrix[3];
      matrix[5] = 256;
    }
    return 'matrix(' + matrix.join(',') + ')';
  }

  private static getForegroundMatrix(flags: string[] = [], size: number = 256): string {
    const matrix: number[] = [1, 0, 0, 1, 0, 0];
    matrix[0] = 256 / size;
    matrix[3] = 256 / size;
    if (flags.includes('FlipForegroundHorizontal')) {
      matrix[0] = -matrix[0];
      matrix[4] = 256;
    }
    if (flags.includes('FlipForegroundVertical')) {
      matrix[3] = -matrix[3];
      matrix[5] = 256;
    }
    return 'matrix(' + matrix.join(',') + ')';
  }
}
