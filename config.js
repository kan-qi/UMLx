var debugOutputDir = "./debug";

function setDebugOutputDir(dir){
	this.debugOutputDir = dir;
}

module.exports ={
		'secret' :'projectumlx',
		'secretUserInvite' :'umlxUserInvite',
		'debugOutputDir': debugOutputDir,
		setDebugOutputDir: setDebugOutputDir
}