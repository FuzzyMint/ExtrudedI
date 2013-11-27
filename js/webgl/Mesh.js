/**
*   Mesh
*/
function Mesh() {
    "use strict";

    this.faces = [];
}

function HE_vert(x,y,z) {
    "use strict";

    this.x = x;
    this.y = y;
    this.z = z;

    this.edge = null; // one of the half-edges which uses the vertex as its starting point
}

function HE_edge(endVertex, face) {
    "use strict";

    this.endVertex = endVertex;
    this.endVertex.edge = this; // Not sure if i need this

    this.oppositeEdge = null;
    this.face = face;
    this.nextEdge = null;
}

function HE_face() {
    "use strict";

    this.edge = null;
}

/*
* Serializes vertex and index list into a mesh by populating half edge datastructure
*/
Mesh.prototype.buildMesh = function(vertices,indices) {
    console.log('Mesh vertices' + vertices);
    console.log('Mesh indices' + indices);

    var he_verts = [];
    var he_edges = [];

    var edge_indices_map = {};
    // Parse vertices
    for (var i = 0; i < vertices.length; i+=3) {
        he_verts.push(new HE_vert(vertices[i], vertices[i+1], vertices[i+2]));
    };

    var numEdgesInFace = 3;
    // Parse edges and faces
    for (var i = 0; i < he_verts.length; i+=numEdgesInFace) {

        var faceForEdges = new HE_face();
        var faceEdges = [];
        for (var j = 0; j < numEdgesInFace; j++) {
            var beginVertexIndex = (i+j);
            var endVertexIndex = i + ((j+1) % numEdgesInFace);

            var beginIndex = indices[beginVertexIndex];
            var endIndex = indices[endVertexIndex];

            var edge = new HE_edge(he_verts[endIndex], faceForEdges);

            if(String([beginIndex,endIndex]) in edge_indices_map) {
                var oppositeEdge = edge_indices_map[String([beginIndex,endIndex])];
                edge.oppositeEdge = oppositeEdge;
                oppositeEdge.oppositeEdge = edge;
            } else if(String([endIndex,beginIndex]) in edge_indices_map) {
                var oppositeEdge = edge_indices_map[String([endIndex,beginIndex])];
                edge.oppositeEdge = oppositeEdge;
                oppositeEdge.oppositeEdge = edge;
            } else {
                edge_indices_map[String([beginIndex,endIndex])] = edge;
            }

            faceEdges.push(edge);
        };
        
        // Assign next edges to all the newly created edges
        for (var j = 0; j < faceEdges.length; j++) {
            faceEdges[j].nextEdge = faceEdges[(j+1) % faceEdges.length];
        };

        // Assign an edge for our face
        faceForEdges.edge = faceEdges[0];
        this.faces.push(faceForEdges);
    };
};

/*
* Deserializes mesh back into an object that can be added to the scene
*/
Mesh.prototype.getObjectFromMesh = function(){
    /*var newObject = {}
    newObject.vertices
    var Triangle = {
    alias           : 'tri',
    dim             : 5,
    vertices        : [1,0.0,0.0, 0.0,1,0.0, 0.0,0.0,1],
    indices         : [0,1,2],
    diffuse         : [0.0, 0.5, 0.5, 1.0],
    wireframe       : false,
    perVertexColor  : false,
    build           : function(d){
                        if (d) Triangle.dim = d;
                        Triangle.vertices = [d,0.0,0.0, 0.0,d,0.0, 0.0,0.0,d];
                      }*/
};

Mesh.prototype.facePoint = function(face) {
    var verts = [];
    var edge = face.edge;
    do {
        verts.push(edge.endVertex);
        edge = edge.nextEdge;
    } while(edge != face.edge);
    
    return sumVerts(verts, true);
};

// Warning: assumes 2 faces are avail
Mesh.prototype.edgePoint = function(edge) {
    
    var vertices = [this.facePoint(edge.face),
    this.facePoint(edge.oppositeEdge.face),
    edge.endVertex,
    edge.oppositeEdge.endVertex];
    
    return sumVerts(vertices, true);
};

Mesh.prototype.vertexPoint = function(vertex) {
    
    var faces = [];
    vertices = [this.facePoint(edge.face),
    this.facePoint(edge.oppositeEdge.face),
    edge.endVertex,
    edge.oppositeEdge.endVertex];
    
    return sumVerts(verts, true);
};

Mesh.prototype.facesFromVertex = function(vertex) {
    var edge = vertex.edge;
    var faceEdge = null;
    var faces = [];

    do {
        faces.push(edge.face);
        faceEdge = edge;
        while(edge.nextEdge != faceEdge) {
            edge = edge.nextEdge;
        }
        edge = edge.oppositeEdge;
    } while(edge != vertex.edge);
    
    return faces;
};

function sumVerts(vertArray, averageFlag) {
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    for (var i = vertArray.length - 1; i >= 0; i--) {
        sumX += vertArray[i].x;
        sumY += vertArray[i].y;
        sumZ += vertArray[i].z;
    };

    if(averageFlag === true) {
        sumX /= vertArray.length;
        sumY /= vertArray.length;
        sumZ /= vertArray.length;
    }

    return new HE_vert(sumX,sumY,sumZ);
};


Mesh.prototype.catmull = function() {
    this.facePoint(this.faces[0]);
    this.edgePoint(this.faces[0].edge.nextEdge.nextEdge);
    console.log(this.facesFromVertex(this.faces[0].edge.endVertex));
    
};