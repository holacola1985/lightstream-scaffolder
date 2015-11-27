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
      this.repository = answers.repository;
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
    copyTemplates: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          appName: this.appName,
          version: this.version,
          description: this.description,
          repository: formatRepository(this.repository),
          keywords: this.keywords ? JSON.stringify(this.keywords.map(function (keyword) {
            return keyword.trim();
          })) : null
        }
      );

      this.fs.copyTpl(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore'));
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
    this.installDependencies({
      npm: true,
      callback: function () {
        spawn('yo lightstream-config', { stdio: 'inherit' });
        spawn('grunt nginx', { stdio: 'inherit' });
        spawn('git init', { stdio: 'inherit' });
        if (this.repository) {
          spawn('git remote add origin ' + this.repository, { stdio: 'inherit' });
          //spawn('git pull origin master', { stdio: 'inherit' });
        }

        this.log('It seems we’re done now !');
        this.log('Git repository has been created and is ready for your first commit');
        this.log('Don’t forget to create a symlink of <lightstream-directory>/app/node in the local app directory !');
        this.log('’Hope everything’s ok and run ! ;)');
      }.bind(this)
    });
  }
});

function defaultGitRepository() {
  try {
    return spawn('git remote -v | grep fetch')
      .match(/:[^:.]*/g)[0]
      .replace(':', '');
  } catch (e) { }
}

//git@github.com:lightstream-company/lightstream-scaffolder.git
function formatRepository(repository) {
  if (/http/g.test(repository)) {
    return repository;
  }

  return 'https://' + repository.replace('git@', '').replace(':', '/').replace('.git', '');
}