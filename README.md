# git操作辅助工具
 
![my love](./hbq-logo.png)

##  使用案例
```javascript
let GitHelper = appUtils.requireCommon('GitHelper');
let remotePath = 'git@xxxxxx.git';
let localPath = 'D:/aaaccccbbbbb';
 route.get('/git', async(ctx, next) => {
     let gitHelper = GitHelper.create(localPath);
     await gitHelper.clone(remotePath, localPath, 'dev');
     ctx.body = global.JSONResponse(1, 11, 'clone成功');
 });
 route.get('/git/reset', async(ctx, next) => {
     let gitHelper = GitHelper.create(localPath);
     await gitHelper.reset('dev');
     ctx.body = global.JSONResponse(1, 11, '重置为dev分支');
 });
 ```