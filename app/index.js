/* jslint node: true */
'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var spawn = require('child_process').execSync;

var prompts = [{
  type: 'input',
  name: 'appName',
  message: 'Your project name',
  default: path.basename(process.cwd())
}, {
  type: 'input',
  name: 'version',
  message: 'Your project initial version',
  default: '0.1.0'
}, {
  type: 'input',
  name: 'description',
  message: 'Quick project description'
}, {
  type: 'input',
  name: 'keywords',
  message: 'Give some keywords (comma separated)'
}, {
  type: 'input',
  name: 'repository',
  message: 'Git repo ?',
  default: defaultGitRepository()
}];

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    this.skeletonDirectory = '.';
    this.appPath = '.';
  },
  prompting: function () {
    var done = this.async();
    this.log('Welcome to Lightstream scaffolder !');
    this.log('Let’s try to scaffold your new Lightstream app !');
    this.log('I hope you’ll get a lot of money with this one :)');

    this.prompt(prompts, function (answers) {
      this.appName = answers.appName;
      this.version = answers.version;
      this.description = answers.description;
      this.keywords = answers.keywords ? answers.keywords.split(',') : null;
      done();
    }.bind(this));
  },
  writing: {
    copyDevelopmentFiles: function () {
      var files = ['.editorconfig', '.eslintrc', 'Gruntfile.js', 'nginx.conf.hbs'];
      files.forEach(function (file) {
        this.copy(
          path.join(this.skeletonDirectory, file),
          path.join(this.appPath, file)
        );
      }.bind(this));
    },
    copyPackageJson: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          appName: this.appName,
          version: this.version,
          description: this.description,
          repository: this.repository,
          keywords: this.keywords ? JSON.stringify(this.keywords.map(function (keyword) {
            return keyword.trim();
          })) : null
        }
      );
    },
    copyAppFiles: function () {
      var files = ['config/index.js', 'app/front/js/main/index.js', 'app/front/less/main/index.less', 'public/index.html'];
      files.forEach(function (file) {
        this.copy(
          path.join(this.skeletonDirectory, file),
          path.join(this.appPath, file)
        );
      }.bind(this));
    }
  },
  install: function () {
    var done = this.async();
    this.installDependencies({
      npm: true,
      callback: function () {
        this.spawnCommand('yo', 'lightstream-config') // yo lightstream config
          .on('close', function () {
            this.spawnCommand('grunt', 'nginx') // grunt nginx
              .on('close', done);
          }.bind(this));
      }.bind(this)
    });
  },
  end: function () {
    this.log('It seems we’re done now !');
    this.log('’Hope everything’s ok and run !');
    this.log('Don’t forget to run : yo lightstream-config and grunt nginx ;)');
  }
});

function defaultGitRepository() {
  try {
    return spawn('git remote -v | grep fetch')
      .match(/:[^:.]*/g)[0]
      .replace(':', '');
  } catch (e) { }
}