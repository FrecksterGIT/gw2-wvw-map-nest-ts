import {Injectable, Logger} from '@nestjs/common';
import svgjs = require('svg.js');
import window = require('svgdom');
import {Gw2ApiService} from '../gw2api/gw2-api.service';

import backgroundDefs from './data/defs.background';
import color2Defs from './data/defs.color2';
import foregroundDefs from './data/defs.foreground';

const SVG = svgjs(window);
const document = window.document;

// d5666a91-2c0a-4417-a8aa-f79c1587d642 - Art Of Skills

// https://guilds.gw2w2w.com/guilds/art-of-skills

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
    const matrix = EmblemService.getBackgroundMatrix(guild.emblem.flags);
    const def = backgroundDefs[guild.emblem.background.id];
    const color = EmblemService.getColor(guild.emblem.background.colors[0]);
    this.add(draw, def.p, color, matrix, .7);
  }

  private drawForeground(draw, guild) {
    const matrix = EmblemService.getForegroundMatrix(guild.emblem.flags);
    const def = foregroundDefs[guild.emblem.foreground.id];
    const color1 = EmblemService.getColor(guild.emblem.foreground.colors[0]);
    const color2 = EmblemService.getColor(guild.emblem.foreground.colors[1]);
    this.add(draw, def.p2, color1, matrix, 1);
    this.add(draw, def.p1, color2, matrix, 1);
    this.add(draw, def.pt1, color2, matrix, .3);
    this.add(draw, def.pto2, '#000', matrix, .3);
  }

  private add(draw: svgjs.Doc, def, color, matrix, opacity) {
    if (!def) {
      return;
    }
    def.forEach((path) => {
      const p = draw.path(path);
      p.attr('fill', color);
      p.attr('stroke', color);
      p.attr('stroke-opacity', '50%');
      p.attr('stroke-width', '.05%');
      p.attr('transform', matrix);
      p.attr('opacity', opacity);
    });
  }

  private static getColor(color) {
    const col = color2Defs.find((cDef) => cDef.id === color).cloth.rgb;
    Logger.log(JSON.stringify(col));
    return 'rgb(' + col.join(',') + ')';
  }

  private static getBackgroundMatrix(flags = []): string {
    const matrix = [1, 0, 0, 1, 0, 0];
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

  private static getForegroundMatrix(flags = []) {
    const matrix = [1, 0, 0, 1, 0, 0];
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
