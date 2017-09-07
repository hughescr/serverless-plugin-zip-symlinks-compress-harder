# Serverless plugin to improve artifact creation

This plugin for serverless will improve artifact creation.  It uses some custom flags for Info-ZIP's command line to reduce artifact file size through:
 - Use the `-9` compression flag for max compression
 - Use the `-y` flag to include symlinks as links not duplicates of the file
 - Use the `-FS` flag to ensure the latest version of a file is in the archive, and remove any file in the archive that isn't in the source directory any more

## To use this plugin

 - `yarn add serverless-plugin-zip-symlinks-compress-harder --dev` or
  `npm install --save-dev serverless-plugin-zip-symlinks-compress-harder`
 - Add `serverless-plugin-zip-symlinks-compress-harder` to the `plugins` section of your `serverless.yml`
 - Add `artifact: something.zip` to the `package` section of your `serverless.yml`

eg:

```
...
package:
  exclude:
    - somefile.json
    - tests/**
    - package.json
    - serverless.yml

  artifact: my-lambda.zip

plugins:
  - serverless-plugin-zip-symlinks-compress-harder
...
```
