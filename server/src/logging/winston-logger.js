const winston = require('winston')
const expressWinston = require('express-winston')
const fs = require('fs')
const WinstonCloudWatch = require('winston-aws-cloudwatch') // Winston-CloudWatch package
require('dotenv').config()
const env = require('../../server-env')

const logger = expressWinston.logger({
  transports: getLoggingTransports(),
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  ignoreRoute: function (req, res) { return false }
})

function getLoggingTransports () {
  const transports = []
  transports.push(new winston.transports.Console())
  if (process.env.NODE_ENV === 'development') {
    transports.push(new winston.transports.File({ filename: './logs/combined.log' }))
  }

  if (process.env.WINSTON_LOGS_CLOUDWATCH === 'true') {
    if (process.env.CLOUDWATCH_ACCESS_KEY_ID && process.env.CLOUDWATCH_SECRET_ACCESS_KEY && process.env.CLOUDWATCH_REGION) {
      const CloudWatchInfo = JSON.parse(fs.readFileSync('./aws_cloudwatch_info.json')) // get CloudWatch log group and stream
      const CloudWatchGroup = CloudWatchInfo.cloudwatch_log_group_name.value
      const CloudWatchStream = CloudWatchInfo.cloudwatch_log_stream_name.value
      transports.push(new WinstonCloudWatch({
        logGroupName: CloudWatchGroup,
        logStreamName: CloudWatchStream,
        createLogGroup: false,
        createLogStream: false,
        awsConfig: {
          accessKeyId: process.env.CLOUDWATCH_ACCESS_KEY_ID,
          secretAccessKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
          region: process.env.CLOUDWATCH_REGION
        },
        timestamp: true
      }))
    } else {
      console.log('CloudWatch Error!! the logs cannot be exported to CloudWatch. Please add the credentials')
    }
  }
  return transports
}

module.exports = logger
