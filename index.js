 const SimpleGit = require('simple-git');
 //流stream中间处理
 const through2 = require('through2');
 const ioHelper = require('iohelper');

 module.exports = class GitHelper {
     constructor(workingDirPath) {
         this.workingDirPath = workingDirPath;
         //创建这个路径
         ioHelper.makeDirSync(workingDirPath);
         this.gitHandler = new SimpleGit(workingDirPath);
         this.outputHandler();
         this.original = SimpleGit;

     }
     outputHandler(newStdout, newStderr) {
         this.gitHandler.outputHandler((command, stdout, stderr) => {
             stdout.pipe(newStdout);
             stderr.pipe(newStderr);
         })
     }
     static create(workingDirPath, stdout, stderr) {
             const instanse = new GitHelper(workingDirPath);
             instanse.outputHandler(through2(function(chunk) {
                 let text = chunk.toString();
                 appUtils.log(`GetHelper out:->${text}`);
                 stdout && stdout(text);
             }), through2(function(chunk) {
                 let text = chunk.toString();
                 appUtils.log(`GetHelper stderr:->${text}`);
                 stderr && stderr(text);
             }));
             return instanse;
         }
         /**
          * 
          * @param {远程仓库地址} repoPath 
          * @param {本地物理路径:会自动创建路径} localPath 
          * @param {分支:默认为master} branch  
          */
     clone(repoPath, localPath, branch) {
             let deferred = Q.defer();
             //删除对应的文件夹
             ioHelper.deleteFile(localPath)
                 .then(() => {
                     //创建对应的文件夹
                     return ioHelper.makeDir(localPath);
                 }).then(() => {
                     this.gitHandler.clone(repoPath, localPath, ['-b', branch || 'master'], (error, data) => {
                         deferred.resolve({ success: !error, error, data });
                     })
                 });
             return deferred.promise;
         }
         //切换分支
     checkout(branchName = '.') {
         return new Promise((resolve) => {
             debugger
             this.gitHandler.checkout(branchName, (error, data) => {
                 resolve({ error, data });
             });
         });
     }
     fetch(branch, remote = 'origin') {
             return new Promise(resolve => {
                 this.gitHandler.fetch(remote, branch, (error, data) => {
                     resolve({ error, data });
                 })
             })
         }
         /**
          * 将本地代码与远程代码同步
          * @param {远程分支名} branch 
          */
     reset(branch) {
             return this.fetch(branch).then(() => {
                 return new Promise(resolve => {
                     this.gitHandler.reset(['--hard', `origin/${branch}`], (error, data) => {
                         resolve({ error, data });
                     });
                 })
             })
         }
         /**
          * 重新设置工作目录
          * @param {新的工作目录} newWorkingDirectory 
          */
     cwd(newWorkingDirectory) {
             this.workingDirPath = newWorkingDirectory;
             return this;
         }
         /**
          *  用来替换默认的输出行为,默认设置为nodejs控制台输出
          * @param {标准输出} _stdout 
          * @param {标准错误} _stderr 
          */
     outputHandler(_stdout, _stderr) {
         return this.gitHandler.outputHandler((command, stdout, stderr) => {
             stdout.pipe(_stdout || process.stdout);
             stderr.pipe(_stderr || process.stderr);
         });
     }
 }