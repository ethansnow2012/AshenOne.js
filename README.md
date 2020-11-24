# Ashenone.js(Beta)
:warning: ** This project is under construction. Feature lacks. Do not use in production unless you understand this project. **: Be very careful here!

## Demo
Account: guest1@gmail.com Password: 123456
[Demo Link](https://ashenonejs-demo.web.app/adminee/catagory)
[Demo Link: Json API](https://ashenonejs-demo.web.app/jet/catagory)

## Commends

- firebase login --interactive
- firebase login --reauth --interactive
- host locally
   - NODE_ENV=development firebase serve --only functions,hosting
## A web app template on firebase with fully declarative CMS.
=======================
firebase only allow cookie named "__session"
=======================

1.
  - copy local file
    - remove .git file for safety
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
    - 地區選US1
  - firestorage 開啟
    - firestorage rule in storage.rules file
  - firebase hosting 開啟
   - replace "project_name" in codebase with actual project id
   - CLI: firebase login
   - CLI: firebase init (do not overwrite rule, not single-page)
    ◉ Database: Deploy Firebase Realtime Database Rules
    ◉ Firestore: Deploy rules and create indexes for Firestore
    ◉ Functions: Configure and deploy Cloud Functions
❯   ◉ Hosting: Configure and deploy Firebase Hosting sites
    ◉ Storage: Deploy Cloud Storage security rules
    ```
    "hosting": [
      {
        "target":"app",
        "public": "public",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "**", 
            "function": "app"  
          }
        ]
      }
    ]
    ```
   - CLI: firebase deploy
   
  - firebase functions 開啟 
    - npm install -g firebase-tools
    - make sure "hosting": { rewrites... } in firebase.json
  - replace adminsdk key(json file) in Settings>>服務帳戶>>admin.initializeApp
  - replace firebaseConfig (shows when start firebase webapp) (copy from firebase console) in 'Firebase SDK snippet' >> 設定
  - bill plan 升級
  -  .firebaserc 指定專案
4. firebase deploy !!!!!!!!
  - make sure /public/index.html not exist (rename it)
  - edit decodedClaims.email=="xxxxx" in factory__express_handle
  - firebase target:apply hosting app <project name>
  - storage.rules(local)
  - 
5. build composite id on createTime-xxxx for getting data with order required the index

=======================

## Example:
Declare the DB schema in "~/functions/index.js" as below.
Then login via "localhost:5000/adminee/login".
Then the CMS will be available in "localhost:5000/adminee/xxxx".
```
let fullDelare = {
    third:{
        model_name: "third",
        uimenu:true,
        schema: () => ({
            name: { type: GraphQLString, editable: true },
            code: { type: GraphQLString },
            parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"third", meta:"self" },
            status: { type: GraphQLString },
            createTime: { type: GraphQLString },
            createBy_uid: { type: GraphQLString },
            img:{ type: GraphQLString, editable: true, uitype:"image" },
            d_key: { type: GraphQLString },
            
        })
    },
    catagory:{
        model_name: "catagory",
        uimenu:true,
        schema: () => ({
            name: { type: GraphQLString, editable: true },
            code: { type: GraphQLString },
            parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"catagory", meta:"self" },
            status: { type: GraphQLString },
            createTime: { type: GraphQLString },
            createBy_uid: { type: GraphQLString },
            img:{ type: GraphQLString, editable: true, uitype:"image" },
            d_key: { type: GraphQLString },
            phoneInfo:{
                type: GraphQLList(schema_manager.tHolder["phoneInfo"]), // mutually dependent
                resolve: async (parent, args) => {  //wrong
                    let rtn = []
                    let snapshot = await storedb.collection('posts')
                        .where('channels_sub', 'array-contains', parent.code)//
                        .get();
                    snapshot.forEach((x) => {
                        rtn.push(x.data())
                    })
                    return rtn
                }
            }
        })
    },
    phoneInfo:{
        model_name: "phoneInfo",
        uimenu:true,
        schema: () => ({
            modelText1: { type: GraphQLString, editable: true },
            catagory_code: { type: GraphQLString, editable: true, uitype:"relation",relation_code:"catagory" },
            modelText2: { type: GraphQLString, editable: true },
            modelText2_price: { type: GraphQLString, editable: true },
            price1: { type: GraphQLString, editable: true},
            price2: { type: GraphQLString, editable: true},
            price3: { type: GraphQLString, editable: true},
            price4: { type: GraphQLString, editable: true},
            img: { type: GraphQLString, editable: true, uitype:"image" },
            content: { type: GraphQLString, editable: true, uitype:"htmlContent" },
            status: { type: GraphQLString },//GraphQLNonNull is not working now
            createTime: { type: GraphQLString },
            createBy_uid: { type: GraphQLString },
            d_key: { type: GraphQLString }
        })
    }
}
```

```
Worning: 
Resolver(graphql) is not yet functional

```

Document:

## \<field name\>: { type: GraphQLString },
String type

## \<field name\>: { type: GraphQLString, editable: true },
String that can be edited

## \<field name\>: { type: GraphQLString, editable: true, uitype:"image" },
String field that stores the url of the image

## d_key: { type: GraphQLString },
String field that is used to store the key auto-generate by forestore

## \<field name\>: { type: GraphQLString, editable: true, uitype:"htmlContent" },
HTML string field that is used generate via tinyMCE

## parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"catagory", meta:"self" }
Relation that refers to self.

## \<other model\>_code: { type: GraphQLString, editable: true, uitype:"relation",relation_code:"\<relation code\>" },
Relation that refers to other model


