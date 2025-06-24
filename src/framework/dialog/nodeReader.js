import ConditionNode from "./nodes/conditionNode.js";
import EventNode from "./nodes/eventNode.js";
import TextNode from "./nodes/textNode.js";
import ChoiceNode from "./nodes/choiceNode.js";

export default class NodeReader {
    constructor() { }

    /**
    * Crea todos los nodos y luego se encarga de conectarlos
    * 
    * SI SE QUIEREN ANADIR NUEVOS NODOS, LO IDEAL SERIA HACER UNA CLASE QUE HEREDE DE 
    * NODEREADER PARA QUE GESTIONE *SOLO* LA CREACION DE NUEVOS TIPOS DE NODOS. 
    * 
    * @param {Phaser.Scene} scene - escena en la que se crea el nodo
    * @param {Object} fullJson - objeto json donde estan los nodos 
    * @param {String} namespace - nombre del archivo de localizacion del que se va a leer 
    * @param {String} objectName - nombre del objeto en el que esta el dialogo, si es que el json contiene varios dialogos de distintos objetos
    * @param {Boolean} getObjs - si se quiere devolver el nodo leido como un objeto 
    * @returns {DialogNode} - nodo raiz de los nodos leidos
    */
    readNodes(scene, file, namespace, objectName, getObjs) {
        let nodesMap = new Map();
        this.createNodes(scene, file, namespace, objectName, getObjs, nodesMap);

        // Recorre todos los nodos guardados en el mapa
        nodesMap.forEach((node) => {
            // Recorre el array de nodos siguientes leyendo sus ids
            for (let i = 0; i < node.next.length; i++) {
                // Obtiene el nodo del mapa a partir de su id y la reemplaza en el array
                let nextNode = nodesMap.get(node.next[i]);
                node.next[i] = nextNode;
            }
            // console.log(node.next)
        });

        return nodesMap.get("root");
    }

    /**
    * Se obtienen todos los nodos del objeto json, se crean dependiendo de su tipo, y se guardan al mapa de nodos
    * @param {Phaser.Scene} scene - escena en la que se crea el nodo
    * @param {Object} fullJson - objeto json donde estan los nodos 
    * @param {String} namespace - nombre del archivo de localizacion del que se va a leer 
    * @param {String} objectName - nombre del objeto en el que esta el dialogo, si es que el json contiene varios dialogos de distintos objetos
    * @param {Boolean} getObjs - si se quiere devolver el nodo leido como un objeto 
    * @param {Map} nodesMap - mapa donde se van a guardar los nodos leidos
    * 
    * IMPORTANTE: La estructura de nodos es comun a todos los idiomas y se tiene que guardar con anterioridad
    * al momento de crear la escena para luego pasarlo como parametro file. El archivo del que se van a leer las
    * traducciones es el que se pasa en el parametro namespace, y tiene que pasarse un string con el nombre del
    * archivo sin la extension .json
    */
    createNodes(scene, fullJson, namespace, objectName, getObjs, nodesMap) {
        let objectJson = (objectName === "") ? fullJson : fullJson[objectName];
        for (const [key, value] of Object.entries(objectJson)) {
            let id = key;

            // La id del nodo debe coincidir tanto en el json como en el archivo de traducciones, pero al estar
            // dentro de un objeto con (por ejemplo) nombre "object", un nodo con la id "name" deberia buscarse 
            // en el archivo de traducciones como object.name, pero la id de nodo seguiria siendo name
            let fullId = (objectName === "") ? id : objectName + "." + id;

            let globalId = namespace + "." + fullId

            // console.log(nodeId, fullId, globalId);

            // Si el nodo no se habia leido, se obtiene su tipo y se crea dependiendo del que sea
            if (!nodesMap.has(globalId)) {
                let type = objectJson[id].type;
                let node = null;

                if (type === ConditionNode.TYPE) {
                    node = this.createConditionNode(scene, objectJson[id])
                }
                else if (type === TextNode.TYPE) {
                    node = this.createTextNode(scene, objectJson[id], fullId, namespace);
                }
                else if (type === ChoiceNode.TYPE) {
                    node = this.createChoiceNode(scene, objectJson[id], fullId, namespace);
                }
                else if (type === EventNode.TYPE) {
                    node = this.createEventNode(scene, objectJson[id]);
                }

                // Si se crea el nodo correctamente, se guarda el resto de parametros y se guarda en el mapa de nodos por su id
                if (node != null) {
                    node.id = id;
                    node.fullId = fullId;
                    node.globalId = globalId;

                    node.nextDelay = (objectJson[id].nextDelay == null) ? 0 : objectJson[id].nextDelay

                    nodesMap.set(id, node);
                }
            }
        }
    }


    // Metodos factoria para crear los distintos tipos de nodos

    createConditionNode(scene, objectJson) {
        return new ConditionNode(scene, objectJson);
    }

    createTextNode(scene, objectJson, fullId, namespace) {
        return new TextNode(scene, objectJson, fullId, namespace);
    }

    createChoiceNode(scene, objectJson, fullId, namespace) {
        return new ChoiceNode(scene, objectJson, fullId, namespace);
    }

    createEventNode(scene, objectJson) {
        return new EventNode(scene, objectJson);
    }
}