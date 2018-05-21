import {Injectable} from '@nestjs/common';
import svgjs = require('svg.js');
import window = require('svgdom');
import {Gw2ApiService} from '../gw2api/gw2-api.service';

import backgroundDefs from './data/defs.background';
import color2Defs from './data/defs.color2';
import foregroundDefs from './data/defs.foreground';

const SVG = svgjs(window);
const document = window.document;

@Injectable()
export class EmblemService {

  public constructor(private readonly gw2ApiService: Gw2ApiService) {
  }

  public async getEmblem(guildId): Promise<string> {
    const guild = await this.gw2ApiService.getGuild(guildId);
    if (guild.emblem && guild.emblem.background && guild.emblem.background.id) {
      document.documentElement.innerHTML = '';
      const draw = new SVG(document.documentElement).size(256, 256);
      this.drawBackground(draw, guild);
      this.drawForeground(draw, guild);
      return draw.svg();
    }
    return '';
  }

  private drawBackground(draw, guild) {
    const def = backgroundDefs[guild.emblem.background.id];
    const matrix = EmblemService.getBackgroundMatrix(guild.emblem.flags, def.size);
    const color = EmblemService.getColor(guild.emblem.background.colors[0]);
    const group = draw.group();
    group.attr('transform', matrix);
    this.add(group, def.p, color, .7);
  }

  private drawForeground(draw, guild) {
    const def = foregroundDefs[guild.emblem.foreground.id];
    const matrix = EmblemService.getForegroundMatrix(guild.emblem.flags, def.size);
    const color1 = EmblemService.getColor(guild.emblem.foreground.colors[0]);
    const color2 = EmblemService.getColor(guild.emblem.foreground.colors[1]);
    const group = draw.group();
    group.attr('transform', matrix);
    this.add(group, def.p2, color1, 1);
    this.add(group, def.p1, color2, 1);
    this.add(group, def.pt1, color1, .3);
    this.add(group, def.pto2, '#000', .3);
  }

  private add(draw: svgjs.Doc, def, color, opacity) {
    if (!def) {
      return;
    }
    const group = draw.group();
    group.attr('fill', color);
    group.attr('stroke', color);
    group.attr('stroke-opacity', '50%');
    group.attr('stroke-width', '.05%');
    group.attr('opacity', opacity);
    def.forEach((path) => {
      group.path(path);
    });
  }

  private static getColor(color) {
    const col = color2Defs.find((cDef) => cDef.id === color).cloth.rgb;
    return 'rgb(' + col.join(',') + ')';
  }

  private static getBackgroundMatrix(flags = [], size = 256): string {
    const matrix = [1, 0, 0, 1, 0, 0];
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

  private static getForegroundMatrix(flags = [], size = 256) {
    const matrix = [1, 0, 0, 1, 0, 0];
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
