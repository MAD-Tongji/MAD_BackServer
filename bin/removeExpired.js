var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var superToken='vt3sPR4f6UanTCFANnyRhud7TvW0l1Ctq4hR8XUo';

ref.authWithCustomToken(superToken,(error,authData)=>{
    if (error) {
            console.log("Login Failed!", error);
    }
    else{
        console.log("Authenticated successfully with payload:", authData);
        // ref = ref.child('token2id');
        // ref.once('value',(snap)=>{
        //     if(snap.val()!=null){
        //         snap.forEach((node)=>{
        //             console.log(node.val().expiration + '\tnow: ' + new Date().getTime());
        //             console.log(node.val().expiration < new Date().getTime());
        //             if(node.val().expiration < new Date().getTime()){
        //                 ref.child(node.key()).remove();
        //             }
        //         });
        //     }
        // });
        ref.child('statistic/user/13162185631').update({balance:0,totalIncome:0});
        ref.child('statistic/user/13162185631/monthly/2016-05').update({income:0});
    }
})
