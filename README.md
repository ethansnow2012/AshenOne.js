## A web app template on firebase with fully declarative CMS.
=======================
1.
  - copy local file
    - remove .git file for savety
  - create new github repo
  - create firebase application(web)
2. 
  - push local file to remote git repo
    - "git init"
    - "git add ."
    - 'git commit -m "first"'
    - "git push --set-upstream origin master"
3. firebase 設定
  - 登入方式 (email)
    - create user && remember the email and password or take notes
  - firestore 開啟
  - firestorage 開啟
    - firestorage rule
  - firebase hosting 開啟
   - CLI: firebase login
   - CLI: firebase init
   - CLI: firebase deploy
  - firebase functions 開啟 
    - npm install -g firebase-tools
    - make sure "hosting": { rewrites... } in firebase.json
  - replace adminsdk key(json file) in Settings>>服務帳戶>>admin.initializeApp
  - replace firebaseConfig (in frontend) (copy from firebase console) in 'Firebase SDK snippet' >> 設定
  - bill plan 升級
  -  .firebaserc 指定專案
4. firebase deploy !!!!!!!!
  - make sure /public/index.html not exist
  - edit decodedClaims.email=="xxxxx" in factory__express_handle
  - firebase target:apply hosting app <project name>
  - storage.rules(local)