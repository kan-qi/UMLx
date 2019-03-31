const umlModelInfoManager = require("./UMLModelInfoManagerMongoDB.js");
const effortPredictor = require("./EffortPredictor.js");

process.on("message", (repoId) => {
    console.log('Reload Worker Received Job');
    console.log("repoId: " + repoId);
    // repoId = JSON.parse(repoId);
    //process.send('ok');
    umlModelInfoManager.queryRepoInfo(repoId, function(repoInfo){
        umlModelInfoManager.reloadRepo(repoInfo, function(repoInfo){
            if(!repoInfo){
                process.send('repoInfo error');
            }
            effortPredictor.predictEffortRepo(repoInfo, function(repoInfo2){
                if(!repoInfo2){
                    process.send("repoInfo2 error");
                }
                umlModelInfoManager.updateRepoInfo(repoInfo2, function(repoInfo3){
                    process.send('ok');
                });
            });
        });
    });
});

