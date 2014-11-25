var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var bot = require('./bot.js');



//===================     CRON JOB      ===================
// server's timezone

var job = new CronJob({
  cronTime: '00 46 09 * * *', //runs everyday at 1 min after 6am
  onTick: bot.start(),
  start: false,
  timeZone: "America/New_York"
});
