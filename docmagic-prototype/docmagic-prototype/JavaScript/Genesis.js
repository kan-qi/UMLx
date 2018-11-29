
var Genesis = {};

Genesis.name = "Genesis";              // Model name

Genesis.attributes = [            // Model attribute list
    "LOANPURP", "FRSTPAYDUE", "BALLDATE", "BALLOON", "NUMMON", "LATECHG", "LATEDAYS", "IOPERIOD", "PLAN", "DEEDPOS", "MAXPBAL", "NEGRELMOS", "LOCKDATE", "LOCKEXPIRE", "LTV", "COMBLTV", "PREINTDAYS", "BPREINT", "LOANTYPE", "AMTZTYPE", "AGNCYNUM", "LENCASENUM", "NOTERATE", "TOTLOANAMT", "LOANAMT1", "DUEAFTER", "PROGRAM", "CLSTARDATE", "MONPAY", "NOTDUEDT", "LOANSTAT", "APCASENUM", "LOANNUM", "PURPRICE", "APPVALUE", "PROPOCCU", "TITLENAMR1", "TITLENAMR2", "TITLEMANR1", "TITLEMANR2", "TITLENAME2", "TITLENAMES", "APPTAKEN", "INTERNAME", "INTERPHONE", "HOUSRATIO", "TOTDEBTRAT", "MARGIN", "INDEXRAT", "FLOORRATE", "CAPRATE", "RCHG1MON", "RCHG1PER", "RCHG2MON", "RCHG2PER", "PCHG1MON", "PCHG1PER", "PCHG2MON", "PCHG2PER", "AGENTID", "PROCID", "OPENDATE", "SUBDATE", "APPRVDATE", "DOCDATE", "FUNDDATE", "CANCDATE", "COMGROSS", "AP_LSTRORD", "AP_RCVDATE", "BRANCHID", "AGENT", "OPENDAYS", "SUBDAYS", "APPRVDAYS", "CLOSEDATE", "REJDATE", "STATDATE", "AGTPERC", "AGTCOM", "PROCPERC", "PROCCOM", "HPHONE", "WPHONE", "INTRATE", "FIXVARLOAN", "PROCESSOR", "NETPROFIT", "LEADNAME", "GROSBRCHK", "USER_FLD", "DAYSTOAPPR", "TOTLOANS", "REBATEAMT", "ACCRTYPE", "ADDLBOR3", "ADDLBOR4", "AGTADDR", "AGTCOMP", "AGTCSZ", "AGTFAX", "AGTLIC", "AGTPAGER", "AGTPHONE", "AGTSSN", "ALLOTHPAY", "AMTFIN", "APPRNAME", "APPRVMMYY", "APR", "AP_DOCCODE", "AP_EXPRDAY", "AP_EXPRDT", "AP_EXPTDAY", "AP_EXPTDT", "AP_RMK1", "AP_RMK2", "AP_RMK3", "ARMTYPE", "BAUTOLOANS", "BCANIVDATE", "BDEPVAL", "BDNMON1", "BDNMON2", "BDNMON3", "BDNMON4", "BDNMON5", "BDNRAT1", "BDNRAT2", "BDNRAT3", "BDNRAT4", "BDNRAT5", "BDROOM1U", "BDROOMAU", "MORTFEE", "BMISLIABS", "BMISLIAPAY", "BNETWORTH", "BOR38", "BOR44", "BOTHINC", "BPOSCASH", "BTOTALBANK", "BTOTALINC", "BTOTASSETS", "BTOTAUTO", "BTOTAUTPAY", "BTOTINC", "BTOTLIAB", "BTOTMONPAY", "BTOTMORPAY", "BTOTMORTS", "BTOTOTHAST", "BTOTREOWN", "BUYDNTYPE", "CANCDAYS", "CANCMMYY", "CASHTOBOR", "CBASEINC", "CITY", "CLOSEDAYS", "CLOSEMMYY", "CLSTARMMYY", "COMPJOINT", "A49", "A50", "BORNO", "MISC04", "DECLARR", "COMMENT1", "COMMENT2", "COMMENT3", "COMMENT4", "COMMENT5", "COMMENT6", "COMMENT7", "COMMENT8", "COMMITDATE", "COMMITNO", "COMPANY", "CONDFLAG", "CONTACDATE", "CONTACDAYS", "CONTACMMYY", "CONTNAME", "COTHINC", "CPOSCASH", "CRIARRAY27", "CRIARRAY28", "CR_DOCCODE", "CR_EXPRDAY", "CR_EXPRDT", "CR_EXPTDAY", "CR_EXPTDT", "CR_LSTRORD", "CR_RCVDATE", "CR_RMK1", "CR_RMK2", "CR_RMK3", "CTOTALINC", "CTOTINC", "CWPHONE", "DATEFILD", "DATEORD", "DATERO1", "DATERO2", "DATERO3", "DAYSINLOCK", "DAYSTOCANC", "DAYSTOCLOS", "DAYSTODOC", "DAYSTOFUND", "DAYSTOHOLD", "DAYSTOREJ", "DAYSTOSUB", "DISCLTYPE", "DISCOUNT", "DOCCODE", "DOCDAYS", "DOCMMYY", "DOCNAME", "DOSFILE", "DOTDATE", "DOWNPYMT", "ESTCLSCOST", "ESTPREPAID", "EXPECTDATE", "EXPECTDAYS", "EXPIREDATE", "EXPIREDAYS", "E_BADDR11", "E_BADDR12", "E_BADDR21", "E_BADDR22", "E_BBUSFX1", "E_BBUSFX2", "E_BBUSPH1", "E_BBUSPH2", "E_BCSZ1", "E_BCSZ2", "E_BNAME1", "E_BNAME2", "E_BTITLE1", "E_BTITLE2", "E_BTYPBUS1", "E_BTYPBUS2", "E_CADDR11", "E_CADDR12", "E_CADDR21", "E_CADDR22", "E_CBUSFX1", "E_CBUSFX2", "E_CBUSPH1", "E_CBUSPH2", "E_CCSZ1", "E_CCSZ2", "E_CNAME1", "E_CNAME2", "E_CTITLE1", "E_CTITLE2", "E_CTYPBUS1", "E_CTYPBUS2", "FAX", "FILEMODE", "FILENM", "FINCHG", "FIRSTNAME", "FIRSTPI", "FLOODINS", "FLPPP1", "FLPPP2", "FLPPP3", "FLPPP4", "FLPPP5", "FSTRATCHDT", "FUDATE", "FUNDDAYS", "FUNDMMYY", "GFECOM1", "GFECOM2", "GFLOANAMT", "GRNDRENT", "GROUP", "HAZARDINS", "HOADUES", "HOLDDATE", "HOLDDAYS", "HOLDMMYY", "BOR35", "BOR36", "CCFINYN", "PREPDARR", "SELRPDARR", "BOR10", "BOR11", "PAIDBY17", "PAIDBY18", "PAIDBY20", "PAIDBY21", "PAIDBY22", "PAIDBY23", "PAIDBY24", "PAIDBY25", "H_ACTTYPE", "H_ATNUM", "H_BRACE", "H_BRNUM", "H_BSEX", "H_BSNUM", "H_CRACE", "H_CRNUM", "H_CSEX", "H_CSNUM", "H_DENIAL", "H_DNNUM", "H_INREPORT", "H_LOANAMT", "H_LOANNUM", "H_LOANPURP", "H_LOANTYPE", "H_LPNUM", "H_LTNUM", "H_MSACO", "H_MSANUM", "H_MSAST", "H_MSATRAC", "H_OCNUM", "H_OPENDATE", "H_PROPOCCU", "H_PTNUM", "H_PURTYPE", "H_TOTALINC", "IMPOUNDS", "IMPPRICE", "INDEXTIE", "INTONLY", "INTPERDAY", "INVLOANNO", "ISAMORT", "ISBUYDN", "LANDPRICE", "LASTMODBY", "LASTMODDT", "LASTNAME", "LASTRORD", "LEADADDR", "LEADCELPH", "LEADCOMP", "LEADCSZ", "LEADFAX", "LEADID", "LEADPAGER", "LEADPHONE", "LENAMORT", "LENDERFLAG", "LOANAMT2", "LOANPREF", "LOANSUFF", "LOCKSTAT", "MAILCSZ", "MAXINTRATE", "MININTRATE", "MORTINS", "NEGAMORT", "NEGCASH", "OPENMMYY", "OTHBORS", "OTHERLOAN", "OTHERPI", "OTHESTDESC", "OTHESTPYMT", "OTHEXPDESC", "OTHFNDDESC", "OTHFNDPYMT", "OTHMONDES", "OTHMONPAY", "PPPENALTY", "PPREFUND", "PREPDATE", "PROJNAME", "PTYPENUM", "QALLOTHPAY", "QBACKCALC", "QBACKRAT", "QBBASEINC", "QBPOSCASH", "QBTOTHINC", "QBTOTINC", "QCASHAVAIL", "QCASHLEFT", "QCASHREQ", "QCBASEINC", "QCDOWNOUT", "QCLTVVAL", "QCPOSCASH", "QCTOTHINC", "QCTOTINC", "QDOWNPMT", "QEXISTMTGS", "QFIRSTMTG", "QFROMTOBOR", "QFRONTCALC", "QFRONTRAT", "QITEMSPAID", "QLTVVAL", "QNEGCASH", "QOTHERMTG", "QOTHEXP", "QOTHPAYOFF", "QPANDI", "QPOFMTGS", "QREQCLTV", "QREQLTV", "QSOACODE", "QSUBORDBAL", "QTOTCLOS", "QTOTINC", "QTOTMONLY", "QTOTMONPAY", "QTOTOTHPAY", "QTOTPRPD", "QUALRATE", "QUNITS", "REBATEPERC", "RECDATE", "RECVEDEPOS", "RECVEFEE", "CONYRACQ", "CONORGCOST", "CONEXLIENS", "LOTPRESVAL", "CONIMPCOST", "REFIMPCOST", "REFIMPDESC", "REFORGCOST", "REFIDESC1", "REFIDESC2", "REFEXLIENS", "REFIMPFLAG", "REFTYPE", "REFVAL", "REFYRACQ", "REGADDR", "REGADDR2", "REGCSZ", "REGNAME", "REGZBALN", "REJDAYS", "REJMMYY", "REMARKS1", "REMARKS2", "REMARKS3", "REP_ADDR", "REP_CELUPH", "REP_CMPNY", "REP_CSZ", "REP_FAX", "REP_NAME", "REP_PAGER", "REP_PHONE", "RETAXES", "SBID", "SBNAME", "SECHOUSACT", "SELCLSCOST", "SELLRADDR", "SELLRCSZ", "SELLRNAME", "STATE", "STDATE021", "STDATE022", "STDATE023", "STDATE024", "STDATE025", "STDATE026", "STDAYS021", "STDAYS022", "STDAYS023", "STDAYS024", "STDAYS025", "STDAYS026", "STDSTO021", "STDSTO022", "STDSTO023", "STDSTO024", "STDSTO025", "STDSTO026", "STMMYY021", "STMMYY022", "STMMYY023", "STMMYY024", "STMMYY025", "STMMYY026", "STRATE", "STREET", "SUBFINANCE", "SUBMMYY", "TARGDATE", "TARGDAYS", "TARGMMYY", "TEL", "TEMPLFILE", "TI_DOCCODE", "TI_EXPRDAY", "TI_EXPRDT", "TI_EXPTDAY", "TI_EXPTDT", "TI_LSTRORD", "TI_RCVDATE", "TI_RMK1", "TI_RMK2", "TI_RMK3", "TOTALCOSTS", "TOTALINC", "TOTALPRES", "TOTALPROP", "TOTBORFEE", "TOTBRKFEE", "TOTCHARGES", "TOTESTPRPD", "TOTESTPYMT", "TOTFNDPYMT", "TOTHOUSEXP", "TOTINCOME", "TOTMONPAY", "TOTPDBYBOR", "TOTPMTS", "TOTPOSCASH", "TOTPREPD", "TOTSELFEE", "TRAN3RD1", "TRAN3RD2", "TRANMET", "TRANSFDT", "TRANSFTIME", "TRANSFUSR", "TRANTYP", "TRCHKNUM", "TRCLEAR", "TRCREDIT", "TRDATE", "TRDEBIT", "TRDESC", "TRSUB", "TRSUBCL", "TRVENID", "TRVOID", "UNDERNAME", "UNFGFEHI", "UNFGFEMI", "UNFGFEPI", "UNFGFERET", "ZIP", "AGTDUE", "AGTPAID", "APPDUE", "APPLDUE", "APPLPAID", "APPPAID", "BROKDUE", "BROKPAID", "CREDDUE", "CREDPAID", "DISCDUE", "DISCPAID", "MGRCOM", "MGRDUE", "MGRPAID", "MGRPERC", "NOCOMAMT1", "NOCOMAMT2", "NOCOMAMT3", "NOCOMAMT4", "NOCOMDESC1", "NOCOMDESC2", "NOCOMDESC3", "NOCOMDESC4", "ORIGDUE", "ORIGPAID", "OTHCOM", "OTHCOM1", "OTHCOM2", "OTHDUE", "OTHDUE1", "OTHDUE2", "OTHPAID", "OTHPAID1", "OTHPAID2", "OTHPERC", "PREMDUE", "PREMPAID", "PROCDUE", "PROCPAID", "TOTDISCFEE", "TOTDUEFEE", "TOTDUEPRF", "TOTLOANPRF", "TOTOUTDUE", "TOTPAIDFEE", "TOTPAIDPRF", "0", "1", "APPVALUE1", "APPVALUE2", "APPVALUE3", "APPVALUE4", "BACKCALC1", "BACKCALC2", "BACKCALC3", "BACKCALC4", "BACKRAT1", "BACKRAT2", "BACKRAT3", "BACKRAT4", "BASECOST1", "BASECOST2", "BASECOST3", "BASECOST4", "CASHAVAIL1", "CASHAVAIL2", "CASHAVAIL3", "CASHAVAIL4", "CASHLEFT1", "CASHLEFT2", "CASHLEFT3", "CASHLEFT4", "CASHREQ1", "CASHREQ2", "CASHREQ3", "CASHREQ4", "CDOWNOUT1", "CDOWNOUT2", "CDOWNOUT3", "CDOWNOUT4", "CLTVVAL1", "CLTVVAL2", "CLTVVAL3", "CLTVVAL4", "COSTSFIN1", "COSTSFIN2", "COSTSFIN3", "COSTSFIN4", "DOWNPMT1", "DOWNPMT2", "DOWNPMT3", "DOWNPMT4", "DUEAFTER1", "DUEAFTER2", "DUEAFTER3", "DUEAFTER4", "FROMTOBOR1", "FROMTOBOR2", "FROMTOBOR3", "FROMTOBOR4", "FRONTCALC1", "FRONTCALC2", "FRONTCALC3", "FRONTCALC4", "FRONTRAT1", "FRONTRAT2", "FRONTRAT3", "FRONTRAT4", "GFLOANAMT1", "GFLOANAMT2", "GFLOANAMT3", "GFLOANAMT4", "INTRATE1", "INTRATE2", "INTRATE3", "INTRATE4", "ITEMSPAID1", "ITEMSPAID2", "ITEMSPAID3", "ITEMSPAID4", "LOANTYPE1", "LOANTYPE2", "LOANTYPE3", "LOANTYPE4", "LTVVAL1", "LTVVAL2", "LTVVAL3", "LTVVAL4", "MLCCOMEXP", "NUMMON1", "NUMMON2", "NUMMON3", "NUMMON4", "PANDI1", "PANDI2", "PANDI3", "PANDI4", "PURPRICE1", "PURPRICE2", "PURPRICE3", "PURPRICE4", "QUALRATE1", "QUALRATE2", "QUALRATE3", "QUALRATE4", "REQCLTV1", "REQCLTV2", "REQCLTV3", "REQCLTV4", "REQLTV1", "REQLTV2", "REQLTV3", "REQLTV4", "SPONADDR", "SPONCSZ", "SPONNAME", "SUBORDBAL1", "SUBORDBAL2", "SUBORDBAL3", "SUBORDBAL4", "TOTCLOS1", "TOTCLOS2", "TOTCLOS3", "TOTCLOS4", "TOTCOSTS1", "TOTCOSTS2", "TOTCOSTS3", "TOTCOSTS4", "TOTFIN1", "TOTFIN2", "TOTFIN3", "TOTFIN4", "TOTINC1", "TOTINC2", "TOTINC3", "TOTINC4", "TOTLNAMT1", "TOTLNAMT2", "TOTLNAMT3", "TOTLNAMT4", "TOTMONLY1", "TOTMONLY2", "TOTMONLY3", "TOTMONLY4", "TOTMONPAY1", "TOTMONPAY2", "TOTMONPAY3", "TOTMONPAY4", "TOTOTHPAY1", "TOTOTHPAY2", "TOTOTHPAY3", "TOTOTHPAY4", "TOTPRPD1", "TOTPRPD2", "TOTPRPD3", "TOTPRPD4"
];

// Model functions


// "data" : the Object or the Array of Objects to be created 
//          specifies the value of each attirbute in Genesis
Genesis.create = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.create(Genesis.name, data, successCB, errorCB);
};


// "id" : the ObjectId of Genesis, must be 24 character hex string 
Genesis.get = function(id, success, error) {
    // Wrap data
    var data = id;

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.get(Genesis.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried
Genesis.read = function(data, success, error) {
    // Wrap data

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.read(Genesis.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Genesis, MUST be 24 character hex string
// "data" : the Object to be modified, specifies the attribute-values to be updated
Genesis.update = function(id, update, success, error) {
    // Wrap data
    var data = {
        "_id" : id,
        "newData" : update
    };

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(Genesis.name, data, successCB, errorCB);
};

// "data" : the Object that specifies the attribute-values to be queried and then deleted
Genesis.delete = function(data, success, error) {
    // Wrap data 

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.delete(Genesis.name, data, successCB, errorCB);
};

// "id" : the ObjectId of Genesis, MUST be 24 character hex string
// "data" : the Object to be replaced, specifies the value of each attirbute in Genesis
Genesis.set = function(id, newData, success, error) {
    // Wrap data
    var data = {"_id" : id, "newData" : newData};

    // Define callback function
    function successCB(msg) {
        // Success handling
        success(msg);
    }

    function errorCB(msg) {
        // Error handling
        error(msg);
    }

    DBAdapter.update(Genesis.name, data, successCB, errorCB);
};

// Add the other functions here


