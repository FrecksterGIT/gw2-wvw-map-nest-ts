export const timetools = {
  COUNTDOWN_TIME: 300,

  now() {
    return new Date();
  },

  diffTime(timeEndString) {
    let timeStart = this.now();
    let timeEnd = Date.parse(timeEndString) / 1000;
    return Math.floor((timeStart - new Date(timeEnd * 1000)) / 1000);
  },

  toDDHHMMSS(timeToFormat) {
    let secNum = timeToFormat;
    let time = '-';
    if (secNum) {
      let days = Math.floor(secNum / 86400);
      secNum -= days * 86400;
      let hours = Math.floor(secNum / 3600);
      secNum -= hours * 3600;
      let minutes = Math.floor(secNum / 60);
      secNum -= minutes * 60;
      let seconds = secNum;

      if (hours < 10) {
        hours = '0' + hours;
      }
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      time = (days > 0 ? days + 'd ' : '');
      time += (hours > 0 || days > 0 ? hours + 'h ' : '');
      time += (minutes > 0 || hours > 0 || days > 0 ? minutes + 'm ' : '');
      time += seconds + 's';
    }
    return time;
  },

  toMMSS(secNum) {
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  },

  getPassedTime(time) {
    return this.toDDHHMMSS(this.diffTime(time));
  },

  getCountdown(time) {
    return this.toMMSS(this.COUNTDOWN_TIME - this.diffTime(time));
  },

  toTime(timeAsString) {
    let time = new Date(Date.parse(timeAsString));
    return time.toLocaleTimeString();
  }
};
