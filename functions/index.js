const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require('firebase-admin');
const express = require('express');
const graphql = require('graphql');
const bodyParser = require('body-parser');
const csrf = require('csurf')
const cookieParser = require('cookie-parser');
const backend_utils = require('./views/v6/backend_utils');
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLInputObjectType
} = require('graphql')

// utils

function obj2literal(obj) // this works with graphql string concatenation
{
    var str = JSON.stringify(obj, 0, 4),
        arr = str.match(/".*?":/g);

    for(var i = 0; i < arr.length; i++){
        str = str.replace(arr[i], arr[i].replace(/"/g,''));
    }
        

    return str;
}


// ===============definitions===================
const define_status = {
    onWeb: "onWeb",
    draft: "draft",
    archieved: "archieved",
    deleted: "deleted"
}
const define_rsp_status = {
    successful: "successful",
    authDenied: "authDenied",
    failed: "failed"
}
// ===============end===================

// ==========graphql arch-fields===================
// arch-fields is mean to be the single declaration for db schema and db UI(popup) and db access
// arch-fields system words: "createTime", "privilege", "code", "createBy_uid", "d_key", "status"
const UserMetaType_archFields = {
    name: { type: GraphQLString },
    email: { type: GraphQLNonNull(GraphQLString) },
    uid: { type: GraphQLNonNull(GraphQLString) },
    privilege: {
        type: GraphQLNonNull(GraphQLInt),
        defaultValue: 0
    },
    createTime: { type: GraphQLString }
}



let fullDelare = {
    product_catagory:{
        model_name: "product_catagory",
        uimenu:true,
        schema: () => ({
            title: { type: GraphQLString, editable: true },
            code: { type: GraphQLString, editable: true },
            parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"product_catagory", meta:"self" },
            subTitle: { type: GraphQLString, editable: true },
            brief: { type: GraphQLString, editable: true, uitype:"htmlContent" },
            content: { type: GraphQLString, editable: true, uitype:"htmlContent" },
            img:{ type: GraphQLString, editable: true, uitype:"image" },
            status: { type: GraphQLString },
            createTime: { type: GraphQLString },
            createBy_uid: { type: GraphQLString },
            d_key: { type: GraphQLString },
            lang: { type: GraphQLString}
        })
    },
    product:{
        model_name: "product",
        uimenu:true,
        schema: () => ({
            title: { type: GraphQLString, editable: true },
            subTitle: { type: GraphQLString, editable: true },
            product_catagory_code: { type: GraphQLString, editable: true, uitype:"relation",relation_code:"product_catagory" },
            code: { type: GraphQLString},
            brief: { type: GraphQLString, editable: true, uitype:"htmlContent" },
            content: { type: GraphQLString, editable: true, uitype:"htmlContent" },
            img:{ type: GraphQLString, editable: true, uitype:"image" },
            pdf:{ type: GraphQLString, editable: true, uitype:"pdf" },
            status: { type: GraphQLString },
            createTime: { type: GraphQLString },
            createBy_uid: { type: GraphQLString },
            img:{ type: GraphQLString, editable: true, uitype:"image" },
            d_key: { type: GraphQLString },
            lang: { type: GraphQLString}
        })
    },
    // third:{
    //     model_name: "third",
    //     uimenu:true,
    //     schema: () => ({
    //         name: { type: GraphQLString, editable: true },
    //         code: { type: GraphQLString },
    //         parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"third", meta:"self" },
    //         status: { type: GraphQLString },
    //         createTime: { type: GraphQLString },
    //         createBy_uid: { type: GraphQLString },
    //         img:{ type: GraphQLString, editable: true, uitype:"image" },
    //         d_key: { type: GraphQLString },
            
    //     })
    // },
    // catagory:{
    //     model_name: "catagory",
    //     uimenu:true,
    //     schema: () => ({
    //         name: { type: GraphQLString, editable: true },
    //         code: { type: GraphQLString },
    //         parent_code: { type: GraphQLString, editable: true, uitype:"relation", relation_code:"catagory", meta:"self" },
    //         status: { type: GraphQLString },
    //         createTime: { type: GraphQLString },
    //         createBy_uid: { type: GraphQLString },
    //         img:{ type: GraphQLString, editable: true, uitype:"image" },
    //         pdf:{ type: GraphQLString, editable: true, uitype:"pdf" },
    //         d_key: { type: GraphQLString },
    //         phoneInfo:{
    //             type: GraphQLList(schema_manager.tHolder["phoneInfo"]), // mutually dependent
    //             resolve: async (parent, args) => {  //wrong
                    
    //                 let rtn = []
    //                 var _collection = storedb.collection("phoneInfo_list");//.where('createBy_uid', '==', args.uid)
                    
    //                 if(false){    
    //                     _collection = _collection.where("createBy_uid", "==", args.uid)
    //                 }else{
    //                     _collection = _collection.where("status", "==", "onWeb")
    //                 }
                    
    //                 const snapshot = await _collection.get();
    //                 snapshot.forEach((x) => {
    //                     let data = x.data()
    //                     data['d_key'] = x.id //!!                           
    //                     rtn.push(data)
    //                 })
    //                 rtn = rtn.filter((x) => x.status == define_status.onWeb)
    //                 rtn = rtn.sort((a,b)=> a.createTime._seconds < b.createTime._seconds)
    //                 return rtn
    //             }
    //         }
    //     })
    // },
    // phoneInfo:{
    //     model_name: "phoneInfo",
    //     uimenu:true,
    //     schema: () => ({
    //         modelText1: { type: GraphQLString, editable: true },
    //         catagory_code: { type: GraphQLString, editable: true, uitype:"relation",relation_code:"catagory" },
    //         modelText2: { type: GraphQLString, editable: true },
    //         modelText2_price: { type: GraphQLString, editable: true },
    //         price1: { type: GraphQLString, editable: true},
    //         price2: { type: GraphQLString, editable: true},
    //         price3: { type: GraphQLString, editable: true},
    //         price4: { type: GraphQLString, editable: true},
    //         img: { type: GraphQLString, editable: true, uitype:"image" },
    //         content: { type: GraphQLString, editable: true, uitype:"htmlContent" },
    //         status: { type: GraphQLString },//GraphQLNonNull is not working now
    //         createTime: { type: GraphQLString },
    //         createBy_uid: { type: GraphQLString },
    //         d_key: { type: GraphQLString }
    //     })
    // }
}

let get_archFields_keyString = (fn_XXX_archFields, fullDeclare, mode=2)=>{
    let _str = ""
    for(x in _temp_obj = fn_XXX_archFields()){
        let tempStr1 = ""
        if(_temp_obj[x].hasOwnProperty("resolve")){
            if(mode==1){
                continue;
            }
            tempStr1 = `${x} {
                ${get_archFields_keyString(fullDeclare[x].schema, fullDeclare, 1)} 
            }`
        }else{
            tempStr1 = x
        }
        _str += tempStr1 + " "
    }
    return _str
}
let get_archFields_keyString_withData = (obj_archFields, data, context) => {
    let _temp_obj = Object.assign({}, obj_archFields);// clone
    let _str = ""
    let uid_server_side = context.uid_server_side || ""
    let user_privilege = context.user_privilege || 1
    for(x in data){
        if( _temp_obj[x] && _temp_obj[x].hasOwnProperty("resolve")){
            delete _temp_obj[x]
        }
        let _value = data[x]
        if(obj_archFields[x]['uitype'] == 'htmlContent'){
            _value = encodeURIComponent(_value)
        }
        _str += `${x}:"${_value}", `
    }
    _str += `createBy_uid: "${uid_server_side}"`
    _str += `user_privilege: "${user_privilege}"`
    
    
    return _str
}

let archFields2inputsFields = (obj_archFields) => {
    let _temp_obj = Object.assign({}, obj_archFields);// clone
    for(x in _temp_obj){
        if(_temp_obj[x].hasOwnProperty("resolve")){
            delete _temp_obj[x]
        }
    }
    return _temp_obj
}


// ==========graphql types============

const UserMetaType = new GraphQLObjectType({
    name: 'UserMeta',
    description: 'This represents a user status',
    fields: () => (UserMetaType_archFields)
})

let _schema_manager = function(fullDelare){
    this.tHolder = {}
    this.fullDelare = fullDelare
}
_schema_manager.prototype.schema_factory = function(delare_name){
    var slf = this.fullDelare[delare_name]
    var sname = slf.model_name
    var stype = new GraphQLObjectType({
        name: sname,
        description: sname + "type",
        fields: () => (slf.schema())
    })
    // holdering here for share 
    Object.defineProperty(this.tHolder, sname, {value: stype});

    let rtn = {  //==================================
        name: sname,
        baseType: this.tHolder[sname],
        getQueryFields: () => {
            let _fieldObj = {}
            _fieldObj[sname+"_list"] = {
                type: GraphQLList(stype), 
                description: sname,
                args: {
                    uid: { type: GraphQLString },
                    where: { type: GraphQLJSONObject }
                },
                resolve: async (parent, args) => {
                    let _schema = fullDelare[sname].schema()
                    let rtn = []
                    var _collection = storedb.collection(sname+"_list").where("createTime", ">", new Date('2010-05-28 08:01:00'))
                    if(args.uid){
                        _collection = _collection.where("createBy_uid", "==", args.uid)
                    }else{
                        _collection = _collection.where("status", "==", "onWeb")
                    }
                    if (args.where) {
                        for (let x in args.where) {
                            _collection = _collection.where(x, "==", args.where[x])
                        }
                    }
                    

                    _collection = _collection.orderBy("createTime", "asc")
                    
                    const snapshot = await _collection.get();
                    snapshot.forEach((x) => {
                        
                        let data = x.data()
                        Object.keys(data).forEach((field)=>{
                            
                            if(_schema[field] && _schema[field].uitype == "htmlContent"){
                                
                                try{
                                    data[field] = decodeURIComponent(data[field]) 
                                }catch(e){

                                }
                            }
                        })
                        
                        data['d_key'] = x.id //!!                           
                        rtn.push(data)
                    })
                    rtn = rtn.filter((x) => x.status == define_status.onWeb || args.uid==x.createBy_uid)
                    rtn = rtn.sort((a,b)=> a.createTime._seconds < b.createTime._seconds)
                    return rtn
                }
            }
            return _fieldObj
        },
        getMutateFields: () => {
            
            let _archFields = slf.schema()
            _archFields['user_privilege'] = { type: GraphQLString }
            _archFields['uid'] = { type: GraphQLString }
            _archFields['lang'] = { type: GraphQLString }
            _archFields['d_key'] = { type: GraphQLString }
            _archFields['createBy_uid'] = { type: GraphQLString }
            _archFields['update'] = { type: GraphQLJSONObject }
    
            _archFields = archFields2inputsFields(_archFields)

            let _fieldObj = {}
            _fieldObj["add_"+sname] = {
                type: stype,
                description: "add "+sname,
                args: _archFields,
                resolve: (parent, args) => {
                    const docRef = storedb.collection(sname+'_list').doc();
                    
                    if(!args.status){args.status = define_status.onWeb}
                    if((!args.user_privilege) || parseInt(args.user_privilege) <= 4 ){
                        throw define_rsp_status.authDenied;
                        return false
                    }
                    args.code = backend_utils.uniqueID()
                    args.code = args.code.toString()
                    args.createTime = admin.firestore.Timestamp.now()
                    
                    const dataset = args
                    const rtn = docRef.set(dataset)
                    return rtn
                }
            }
            _fieldObj["mutate_"+sname] = {
                type: stype,
                description: "edit "+sname,
                args: _archFields,
                resolve: async (parent, args) => {
                    if( args.update ){
                        let _schema = fullDelare[sname].schema()
                        // mutation pre-check
                        let check_docRef = storedb.collection(sname+'_list').doc(args.d_key);
                        let check_rtn = await check_docRef.get()
                        let check_data = check_rtn.data()
                        if(check_data.createBy_uid != args.uid && parseInt(args.user_privilege) < 5 ){
                            throw define_rsp_status.authDenied
                        }
                        // ====
                        let docRef = storedb.collection(sname+'_list').doc(args.d_key);
                        var rtn = await docRef.update(args.update)
                        if(rtn._writeTime){
                            rtn = {}
                            rtn[Object.keys(_schema)[0]] = "null"
                            return rtn // still need to return something
                        }
                        return rtn
                        
                    }
                    
                }
            }
            return _fieldObj
        },
    }
    rtn[`get_${sname}_list`] = async function ({where}, {req, res, context}) {
        let lang = context.lang || 'tw'
        let whereStr = ""
        if(!where){where={}}
        where.lang = lang
        if(where){
            for(x in where){
                if(!where[x]){
                    delete where[x]
                }
            }
            whereStr = `(where: ${obj2literal(where)})`//.replace(/({|})/g,"")
        }
        //whereStr = ""
        return graphql.graphql(schema, `
        {
            ${sname}_list${ whereStr? whereStr:""}{
                ${get_archFields_keyString(slf.schema, fullDelare)}
                
            }
        }
        `).then((x) => {
            let first_key = Object.keys(x.data)[0]
            return x.data[first_key]
        })
        .catch((x) => {
            return define_rsp_status.failed
        })
    }
    rtn[`add_${sname}`] = async function (req, res, context) {
        // "get_archFields_keyString_withData" handle the "editable behavior" 
        let lang = context.lang
        let archFields = slf.schema()
        return graphql.graphql(schema, `
        mutation{
            add_${sname}(
                ${get_archFields_keyString_withData(archFields, req.body.data, context)}
                ,lang:"${lang}" 
            ){
                ${Object.keys(archFields)[0]}
            }
        }
        `).then((x) => {
            if (typeof x.errors != 'undefined') {
                throw define_rsp_status.authDenied;
            }
            return define_rsp_status.successful
        })
        .catch((x) => {
            if(x==define_rsp_status.authDenied){
                return define_rsp_status.authDenied
            }
            return define_rsp_status.failed
        })
    }
    rtn[`mutate_${sname}`] = async function (d_key, {req, res, context}) {
        let archFields = slf.schema()
        return graphql.graphql(schema, `
        mutation{
            mutate_${sname}(
                user_privilege:"${context.user_privilege}",
                uid:"${context.uid_server_side}",
                d_key: "${d_key}",
                update: ${ obj2literal(req.body.data)}
            ){
                ${Object.keys(archFields)[0]}
            }
        }
        `).then((x) => {
            if (typeof x.errors != 'undefined') {
                throw define_rsp_status.authDenied;
            }
            return define_rsp_status.successful
        })
        .catch((x) => {
            //x.errors[0]
            if(x==define_rsp_status.authDenied){
                return define_rsp_status.authDenied
            }
            // if(x.errors[0].stack.includes("not enough authority")||x.errors[0].stack.includes(`Cannot read property 'createBy_uid'`)){
            //     return define_rsp_status.authDenied
            // }
            return define_rsp_status.failed
        })
    }
    

    return rtn
}

let schema_manager = new _schema_manager(fullDelare)


// ==============graphql schema declaratives==================
var rootQueryObj = {
    
}
var rootMutationObj = {
    
}
// All schema definition should be declare below:
var schema_list = {
    userMeta:{
        name: "userMeta",
        baseType: UserMetaType,
        getQueryFields: () => {
            return {
                get_userMeta: {  //================User===================
                    type: UserMetaType,
                    description: 'A User Meta',
                    args: {
                        uid: { type: GraphQLNonNull(GraphQLString) }
                    },
                    resolve: async (parent, args) => {
                        let rtn = []
                        let _ref = await storedb.collection("userMetas").where("uid", "==", args.uid).get()
                        _ref.forEach((x) => {
                            rtn.push(x.data())
                        })
                        return rtn[0]
                    }
                }
            }
        },
        getMutateFields: () => {
            return {
                addUserMeta: {
                    type: UserMetaType,
                    description: 'UserMeta',
                    args: UserMetaType_archFields,
                    resolve: (parent, args) => {
                        const docRef = storedb.collection('userMetas').doc();
                        const rtn = docRef.set({
                            name: args.name ? args.name : null,
                            uid: args.uid,
                            privilege: args.privilege,
                            createTime: admin.firestore.Timestamp.now()
                        })
                        return rtn
            
                    }
                }
            }
        },
        addusermeta: async function (email, name, uid) {
            return graphql.graphql(schema, `
                mutation{
                    addUserMeta(
                        email:"${email}",
                        name:"${name}",
                        uid:"${uid}"
                    ){
                        name
                    }
                }
                `).then((x) => {
                return "true"
            }).catch((x) => {
                return "false"
            })
        },
        getusermeta: async function (req, res, context) {
            let uid = context.uid_server_side || context.uid
            return graphql.graphql(schema, `
            {
                get_userMeta(
                    uid:"${uid}"
                ){
                    name,
                    uid,
                    privilege,
                    createTime
                }
            }
            `).then((x) => {
                let first_key = Object.keys(x.data)[0]
                return x.data[first_key]
            }).catch((x) => {
                return false
            })
        }
    },
    fn:{
        schema2uischema: (schema) => {
            let rtn = {}
            let x = ""
            let keys = Object.keys(schema)
            
            //for(x in schema){
            for (var i=keys.length-1; i>=0; i--) {   // reverse 
                x = keys[i]
                if(schema[x].editable){
                    if(schema[x].uitype == "htmlContent"){
                        rtn[x] = { type:"tedit" }
                    }else if(schema[x].meta == "self" ){
                        rtn[x] = { type:"relation", relation_code:schema[x].relation_code, meta: "self" }
                    }else if(schema[x].uitype == "relation"){
                        rtn[x] = { type:"relation", relation_code:schema[x].relation_code }
                    }else if(schema[x].uitype == "image"){
                        rtn[x] = { type:"image" }
                    }else if(schema[x].uitype == "pdf"){
                        rtn[x] = { type:"pdf" }
                    }else if(schema[x].type.name == "String"){
                        rtn[x] = { type:"string" }
                    } 
                }
            }
            return rtn
        }
    }
}
for(key in fullDelare){
    schema_list[key] = schema_manager.schema_factory(key)
}


    
// =================end==================

for (var el_key in schema_list) {
    let el = schema_list[el_key]
    if(el.getQueryFields){
        var _query = el.getQueryFields()
        for (var key in _query) {
            rootQueryObj[key] = _query[key]
        }
    }
    if(el.getMutateFields){
        var _mutation = el.getMutateFields()
        for (var key in _mutation) {
            rootMutationObj[key] = _mutation[key]
        }
    }
    
}

// ==== schema composition ===
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => (rootQueryObj)
})
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => (rootMutationObj)
})
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
// ====end====

const serviceAccount = require("./firebaseKeys.json");

var defaultApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://xxxx.firebaseio.com"
})
var defaultAuth = defaultApp.auth();
const storedb = admin.firestore();

//const htmlLoader = require('./html/htmlLoader.js');
//const htmlLoader1 = new htmlLoader();
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cookieParser(['array', 'of', 'secrets']));

// on future requests, the UID can be found using `req.cookies['__session'].uid`

var csrfProtection = null

if( process.env.NODE_ENV == "development"){
    csrfProtection = function (req, res, next){  next(); return true }
}else{
    csrfProtection = csrf({ cookie: true, sessionKey: "__session" })
}
app.use( function(req, res, next){
    if( req._parsedUrl.pathname === '/sessionLogout' || req._parsedUrl.pathname === '/sessionLogin'){ 
        next()
    }else{
        csrfProtection(req, res, next)
    }
} );

//app.use(csrfProtection)
    
var factory__express_handle = function (fn) {
    
    return async function (req, res) {
        var sessionCookie = req.cookies.__session || '';
        sessionCookie = sessionCookie.split(`|ddsdd|`)
            .map((x,ii)=>{
                if(ii==0){ return {"__session":x} }
                let aa = x.split(":")
                let rtn = {}
                rtn[aa[0]] = aa[1]
                return rtn
            }).filter((x)=>{
                return x[Object.keys(x)[0]]
            }).reduce((acc, x)=>{ let index=Object.keys(x)[0] ;acc[index] = x[index] ;return acc },{})
        var context = {}
        
        context.lang = sessionCookie.lang || 'tw'

        context.ssr_data = {}
        context.uid_server_side = ""
        context.user_privilege = ""
        admin.auth().verifySessionCookie(sessionCookie['__session']|| "", true /** checkRevoked */)
            .then((decodedClaims) => {
                context.logedin = true
                
                if (decodedClaims.user_id) {
                    context.uid_server_side = decodedClaims.user_id
                }
                if(decodedClaims.email=="hcec_admin@gmail.com"){
                    context.user_privilege = 5
                }
                
                
                fn(req, res, context)
            })
            .catch(error => {
                context.error = error
                context.logedin = false
                fn(req, res, context)
            });
    }
}
//============== post ==============

app.post('/sessionLogout', (req, res) => {
    res.clearCookie('__session');
    res.redirect("./");
});
app.post('/sessionLogin', (req, res) => {
    // Get the ID token passed and the CSRF token.
    const idToken = req.body.idToken.toString();
    const csrfToken = req.body.csrfToken.toString();
    const uid = req.body.uid.toString();
    const email = req.body.email.toString();
    var context = {}
    if (csrfToken !== req.cookies.csrfToken && false) {
        res.status(401).send('UNAUTHORIZED REQUEST!');
        return;
    }
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    admin.auth().createSessionCookie(idToken, { expiresIn })
        .then(async (sessionCookie) => {
            // Set cookie policy for session cookie.
            context.uid = uid
            var userMeta = null
            
            userMeta = await schema_list.userMeta.getusermeta(req, res, context)
            if (!userMeta) {
                await schema_list.userMeta.addusermeta(email, "", uid)
                userMeta = await schema_list.userMeta.getusermeta(req, res, context)
            }
            const options = { maxAge: expiresIn, httpOnly: false, secure: false };
            res.cookie('__session', sessionCookie, options);
            res.end(JSON.stringify({ status: 'success' }));
        }, error => {
            res.status(401).send('UNAUTHORIZED REQUEST!');
        });
});
app.post(`/post_contact_info`, factory__express_handle(
    async function (req, res, context) {

        
        
        const docRef = storedb.collection('aaa_contact_list').doc();
        const rtn = await docRef.set(req.body.data)

        


        

        res.json(rtn)
        res.end()
    }
))

//fullDelare
Object.keys(schema_manager.fullDelare).forEach((key)=>{
    app.post(`/add_${key}`, factory__express_handle(
        async function (req, res, context) {
            if(!context.user_privilege>=4){
                //res.json({msg:"Sorry, you don't have the privilege "})
                return
            }     
            var rsp = await schema_list[key][`add_${key}`](req, res, context)
            res.json(rsp)
            res.end()
        }
    ))
    app.post(`/update_${key}`, factory__express_handle(
        async function (req, res, context) {
            if(!context.user_privilege>=4){
                //res.json({msg:"Sorry, you don't have the privilege "})
                return
            }        
            //
            var rsp = await schema_list[key][`mutate_${key}`](req.body.d_key, {req, res, context})
            res.json(rsp)
            res.end()
        }
    ))
    app.post(`/delete_${key}`, factory__express_handle(
        async function (req, res, context) {
            if(!context.user_privilege>=4){
                //res.json({msg:"Sorry, you don't have the privilege "})
                return
            }      
            req.body.data.status = define_status.deleted // action of delete
            var rsp = await schema_list[key][`mutate_${key}`](req.body.d_key, {req, res, context})
            res.json(rsp)
            res.end()
        }
    ))
})

// frontend meta
const s_text = {
    menu_txt1:{
        tw:"Home",
        en:"Home"
    },
    menu_txt2:{
        tw:"關於弘誠",
        en:"About"
    },
    menu_txt3:{
        tw:"產品介紹",
        en:"Product"
    },
    menu_txt4:{
        tw:"聯絡弘誠",
        en:"Contact"
    },
}
// ==============end==================
app.get('/test/test',async function (req, res, context) {
    res.send("test")
})
app.get('/blank', async function (req, res, context) {
        res.send('hello world');
    }
)

function fac_g_product_catagory(){
    return async function(req, res, context){
        
        let g_product_catagory = await schema_list.product_catagory.get_product_catagory_list({where:{parent_code: "-1"}}, {req, res, context})
        let promises = []
        for(el of g_product_catagory) {
            promises.push(schema_list.product_catagory.get_product_catagory_list({where:{parent_code: el.code}}, {req, res, context}))
        }
        let l2 = await Promise.all(promises)
        .then( async (values) => {
            values = values.map((x,ii)=>{
                let parent = g_product_catagory[ii]
                if(!x.length){
                    return schema_list.product.get_product_list({where:{product_catagory_code:parent.code}}, {req, res, context})
                }
                x.continue = "true"
                return x
            })
            return await Promise.all(values).then((x)=>{
                return x
            })
        })
        let l2_flat = [];
        l2_flat = [].concat.apply(l2_flat,l2);
        l2_flat = l2_flat.filter((x)=>{

            return x.product_catagory_code==undefined 
        })
        let l3 = await Promise.all(
            l2_flat.map((parent)=>{
            return schema_list.product.get_product_list({where:{product_catagory_code:parent.code}}, {req, res, context})
        }))
        .then((value)=>{
            let value_flat=[];return [].concat.apply(value_flat,value); 
        })
        let l3_object = {}
        l3.forEach((el)=>{
            l3_object['code'] = el.code
        })
        var ii = 0
        for(el of l2) {
            for(el_inner of el) {
                if(el_inner.product_catagory_code == undefined){
                    el_inner.children = l3.filter(x=>x['product_catagory_code']==el_inner.code)
                }
            }
            
        }
        var ii = 0
        for(el of g_product_catagory) {
            el.children = l2[ii]
            ii++
        }
        return g_product_catagory
    }
}
app.get('/', factory__express_handle(
    async function (req, res, context) {
        context.s_text = s_text;
        context['route_code'] = "/"

        //let aa = await schema_list.product.get_product_list({where:{product_catagory_code:"1217019508495"}}, {req, res, context})

        let fn_g_product_catagory = fac_g_product_catagory()
        let g_product_catagory = await fn_g_product_catagory(req, res, context)
        

        context['ssr_data']['g_product_catagory'] = g_product_catagory
        context['ssr_data']['product_catagory'] = g_product_catagory

        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v7/index', { csrfToken: csrfToken, context: context })
    }
))
app.get('/about', factory__express_handle(
    async function (req, res, context) {
        context.s_text = s_text;
        context['route_code'] = "/about"

        let fn_g_product_catagory = fac_g_product_catagory()
        let g_product_catagory = await fn_g_product_catagory(req, res, context)

        context['ssr_data']['g_product_catagory'] = g_product_catagory

        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v7/about', { csrfToken: csrfToken, context: context })
    }
))
app.get('/contact', factory__express_handle(
    async function (req, res, context) {
        context.s_text = s_text;
        context['route_code'] = "/contact"

        let fn_g_product_catagory = fac_g_product_catagory()
        let g_product_catagory = await fn_g_product_catagory(req, res, context)

        context['ssr_data']['g_product_catagory'] = g_product_catagory

        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v7/contact', { csrfToken: csrfToken, context: context })
    }
))
app.get('/products(/:code)?', factory__express_handle(
    async function (req, res, context) {
        context.s_text = s_text;

        context['code'] = req.params.code
        context['route_code'] = "/products"

        let fn_g_product_catagory = fac_g_product_catagory()
        let g_product_catagory = await fn_g_product_catagory(req, res, context)
        context['ssr_data']['g_product_catagory'] = g_product_catagory

        let product_catagory
        if(!req.params.code){
            product_catagory = g_product_catagory
            context['ssr_data']['product_catagory'] = product_catagory
            context['ssr_data']['product_catagory_child'] =  product_catagory
        }else{
            product_catagory = await schema_list.product_catagory.get_product_catagory_list({where:{code: req.params.code}}, {req, res, context})
            context['ssr_data']['product_catagory'] = product_catagory
            if(product_catagory[0]){
                let product_catagory_child = await schema_list.product_catagory.get_product_catagory_list({where:{parent_code:product_catagory[0].code}}, {req, res, context})
                context['ssr_data']['product_catagory_child'] =  product_catagory_child
            }
        }
        
        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v7/products', { csrfToken: csrfToken, context: context })
    }
))
app.get('/:code', factory__express_handle(
    async function (req, res, context) {
        context.s_text = s_text;

        context['code'] = req.params.code
        context['route_code'] = "/product"

        let fn_g_product_catagory = fac_g_product_catagory()
        let g_product_catagory = await fn_g_product_catagory(req, res, context)
        context['ssr_data']['g_product_catagory'] = g_product_catagory
        
        let product = await schema_list.product.get_product_list({where:{code: req.params.code}}, {req, res, context})
        context['ssr_data']['product'] = product

        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v7/product', { csrfToken: csrfToken, context: context })
    }
))
app.get('/adminee', factory__express_handle(
    async function (req, res, context) {//11
        let catagory_list = await schema_list.catagory.get_catagory_list({}, {req, res, context})
        let phoneInfo_list = await schema_list.phoneInfo.get_phoneInfo_list({}, {req, res, context})
        context['ssr_data']['schema_key'] = Object.keys(schema_manager.fullDelare)
        context['ssr_data']['catagory_uischema'] = schema_list.fn.schema2uischema(schema_manager.fullDelare.catagory.schema())
        context['ssr_data']['catagory_uiphoneInfo'] = schema_list.fn.schema2uischema(schema_manager.fullDelare.phoneInfo.schema())
        context['ssr_data']['catagory_list'] = catagory_list
        context['ssr_data']['phoneInfo_list'] = phoneInfo_list
        context['ssr_data']['posts'] = {}
        context['adminpage'] = true
        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v6/index', { csrfToken: csrfToken, context: context })
    }
))
app.get('/adminee/login', factory__express_handle(
    async function (req, res, context) {//11
        if(context['uid_server_side']){
            res.redirect('/adminee/index1')
            return
        }
        context['adminlogin'] = true
        context['adminpage'] = true
        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v6/pages/login', { csrfToken: csrfToken, context: context })
    }
))
app.get('/jet/:schema_key', factory__express_handle(
    async function (req, res, context) {
        
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

        context['ssr_data']['schema_key'] = Object.keys(schema_manager.fullDelare)
        context['schema_key'] = req.params.schema_key || context['ssr_data']['schema_key'][ Object.keys(context['ssr_data']['schema_key'])[0] ]
        let data = context['ssr_data'][`${req.params.schema_key}_list`] = await schema_list[req.params.schema_key][`get_${req.params.schema_key}_list`]({}, {req, res, context})
        res.json(data)
    }
))
app.get('/adminee/:schema_key', factory__express_handle(
    async function (req, res, context) {//11
        if(!context['uid_server_side']){
            res.redirect('/adminee/login')
            return
        }
        
        context['ssr_data']['schema_key'] = Object.keys(schema_manager.fullDelare)
        for(key of context['ssr_data']['schema_key']){
            context['ssr_data'][`${key}_uischema`] = schema_list.fn.schema2uischema(schema_manager.fullDelare[key].schema())
            context['ssr_data'][`${key}_list`] = await schema_list[key][`get_${key}_list`]({}, {req, res, context})
        }
        
        context['schema_key'] = req.params.schema_key || context['ssr_data']['schema_key'][ Object.keys(context['ssr_data']['schema_key'])[0] ]
        context['adminpage'] = true
        
        let csrfToken = req.csrfToken?req.csrfToken():""
        res.render('v6/admin_index', { csrfToken: csrfToken, context: context })
    }
))


exports.app = functions.https.onRequest(app);
//exports.cstore = functions.https.onRequest(app);


