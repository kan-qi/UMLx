import nltk

inp=['Click "User management"','Select aspecific user and click "Activate"']

resp=[["Validate the role of user",\
        'If validate failed,return unauthorized action information',\
        'If validate succeed, return user management page'],
     ["Check the status of user",\
        "If the status is activated,return wrong action message",\
        "If the status is inactivated,activate the user and change the status of user in the database"]]

# In inp
# separete (")-> be able to fine main subject

# In Resp
# Verb and Noun are important 
# if -> the hint word for status (failed, succeed...)

# 1. System Operator
# 2. Data Object
#    -> wm......
# 3. Condition

# stopword_list = to get rid of useless words
stopword_list=[",","is","the"]


for k in range(len(inp)):
    main=inp[k]
    main_info=main.split('"')[1]
    print('Main : '+ main_info)
    
    for i in resp[k]:
        texts = nltk.word_tokenize(i)
        result=nltk.pos_tag(texts)
        
        
        #print(words)

        if result[0][1]=="VB":
            print("Operation : "+ result[0][0])
            print("Data Object : "+ result[2][0]+"/"+result[4][0])  
                    
            
        if result[0][0]=='If':
            #print(result)
            #print(stopword_list)
            
            words_list=[]
            for w in texts:
                if not w in stopword_list:
                    words_list.append(w)
                    
            print("Condition : " + words_list[1],"/ Condition Info :" + words_list[2])
            #print()
