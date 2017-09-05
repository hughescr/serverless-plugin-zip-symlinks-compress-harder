'use strict';

const path = require('path');
const util = require('util');
const spawnSync = require('child_process').spawnSync;

class ZipSymlinksHarder {
  constructor(serverless, options) {
    this.serverless = serverless
    this.package = serverless.service.package

    this.zipFileName = path.join(serverless.config.servicePath, serverless.service.package.artifact)

    let excludes = this.package.exclude || []
    this.patterns = this.package.include || ['**']
    excludes.forEach((pattern) => this.patterns.push(`!${pattern}`))

    this.hooks = {
      'before:deploy:createDeploymentArtifacts': this.createArtifact.bind(this),
    };
  }

  createArtifact() {

    let glob;
    try {
        glob = require(path.join(this.serverless.config.serverlessPath,'..','node_modules','glob-all')) // Use glob-all that serverless includes
    } catch (e) {
        glob = require(path.join(this.serverless.config.serverlessPath,'..','node_modules','globby')) // Use globby that serverless includes
    }

    const files = glob.sync(this.patterns)

    this.serverless.cli.log(`Will write ${files.length} files to ${this.zipFileName}`)

    const arg = files
    arg.unshift(this.zipFileName)   // Prepend zipfile name
    arg.unshift('-9yFS')            // Prepend high compression with symlink preservation and deleting old files
    const zipResults = spawnSync('/usr/bin/zip', arg, { cwd: this.path, encoding: 'utf8' });
    if(zipResults.status != 0) {
        this.serverless.cli.log('Error while running "zip":');
        this.serverless.cli.log(zipResults.stderr);
        return;
    }
    this.serverless.cli.log(zipResults.stdout.trim());
  }
}

module.exports = ZipSymlinksHarder;
