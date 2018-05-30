'use strict';

const path = require('path');
const util = require('util');
const glob = require('globby');
const spawnSync = require('child_process').spawnSync;
const execSync = require('child_process').execSync;

class ZipSymlinksHarder {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.package = serverless.service.package;

    this.zipFileName = path.join(serverless.config.servicePath, serverless.service.package.artifact);

    let excludes = this.package.exclude || [];
    this.patterns = this.package.include || ['**'];

    this.patterns.push(`!${this.zipFileName}`);

    excludes.forEach((pattern) => this.patterns.push(`!${pattern}`));

    this.patterns.push('!node_modules/**');
    const prodDependencies = execSync("yarn list --flat --prod | head -n -1 | tail -n +2 | cut -d' ' -f 2|cut -d'@' -f1", { encoding: 'utf8' })
                                .split('\n')
                                .filter((p) => !!p.trim()) // Remove any blank lines
                                .map((p) => `node_modules/${p}/**`) // Convert to relative paths
                                .filter((p) => p.indexOf('node_modules') === 0); // Only include things in node_modules

    prodDependencies.forEach((pattern) => this.patterns.push(`${pattern}`));

    this.hooks = {
      'before:deploy:createDeploymentArtifacts': this.createArtifact.bind(this),
    };
  }

  createArtifact() {
    const files = glob.sync(this.patterns);

    this.serverless.cli.log(`Will write ${files.length} files to ${this.zipFileName}`);

    const arg = ['-9yFS@', this.zipFileName];
    const zipResults = spawnSync('/usr/bin/zip', arg, { cwd: this.path, encoding: 'utf8', input: files.join('\n') });
    if(zipResults.status != 0) {
        this.serverless.cli.log(`Error while running "zip":`);
        this.serverless.cli.log(util.inspect(zipResults));
        return;
    }
    this.serverless.cli.log(zipResults.stdout.trim());
  }
}

module.exports = ZipSymlinksHarder;
