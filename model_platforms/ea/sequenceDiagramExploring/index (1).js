const fs = require('fs');
const SeqDiagramJSON = {
    Objects: [
        {
            id: 1,
            name: 'Foo1',
            type: 'actor'
        },
        {
            id: 2,
            name: 'Foo2',
            type: 'boundary'
        },
        {
            id: 3,
            name: 'Foo3',
            type: 'control'
        },
        {
            id: 4,
            name: 'Foo4',
            type: 'entity'
        },
        {
            id: 5,
            name: 'Foo5',
            type: 'database'
        },
        {
            id: 6,
            name: 'Foo6',
            type: 'collections'
        }
    ],
    Dependencies: [
        {
            label: "To boundary",
            start: 1,
            end: 2
        },
        {
            label: "To control",
            start: 1,
            end: 3
        },
        {
            label: "To entity",
            start: 1,
            end: 4
        },
        {
            label: "To database",
            start: 1,
            end: 5
        },
        {
            label: "To collections",
            start: 1,
            end: 6
        }
    ]
};

function generate(plantUmlJson) {
    let graph = '@startuml\n';

    plantUmlJson.Objects.forEach(object => {
        graph += `${object.type} ${object.name}\n`;
    });

    plantUmlJson.Dependencies.forEach(dependency => {
        let start;
        let end;
        
        start = plantUmlJson.Objects.filter(object => object.id === dependency.start)[0].name;
        end = plantUmlJson.Objects.filter(object => object.id === dependency.end)[0].name;
        graph += `${start} -> ${end} : ${dependency.label}\n`;
    });

    graph += '@enduml';

    fs.writeFile('SequenceDiagram.plantuml', graph, () => {
        console.log(graph);
    });
    
}

generate(SeqDiagramJSON);


