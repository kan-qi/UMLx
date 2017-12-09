mysql.getSession({
        host: 'localhost',
        port: 33060,
        dbUser: 'flyqk',
        dbPassword: 'qk19910428'
    })
    .then(session => {
        console.log('Session created');
        
        return session.createSchema('test_schema');
    })
    .then(schema => {
        console.log('Schema created');
        
        return schema.createCollection('myCollection');
    })
    .then(collection => {
        console.log('Collection created')
        collection
                .add({ baz: { foo: 'bar' } }, { foo: { bar: 'baz' } })
                .execute();
    })