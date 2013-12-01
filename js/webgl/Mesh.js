/**
*   Mesh
*/
function Mesh() {
    "use strict";

    this.faces = [];
    this.he_verts = [];
    this.he_vert_indices = [];
    this.numberOfIndices = 0;
    this.numberOfFaces = 0;
    this.numEdgesInFace = 4;
    this.originalVertices = [];
}

function HE_vert(x, y, z, index) {
    "use strict";

    this.x = x;
    this.y = y;
    this.z = z;
    this.index = index;
    this.isHoleVertex = true;

    this.edges = [];
}

function HE_edge() {
    "use strict";

    this.beginVertex = null;
    this.endVertex = null;
    this.oppositeEdge = null;
    this.face = null;
    this.nextEdge = null;
    this.isHoleEdge = true;
}

function HE_face() {
    "use strict";

    this.edge = null;
    this.id = -1;
}

/*
* Serializes vertex and index list into a mesh by populating half edge datastructure
*/
Mesh.prototype.buildMesh = function(vertices,indices) {
    console.log('Mesh vertices' + vertices);
    console.log('Mesh indices' + indices);
    this.he_verts = vertices;
    var edge_indices_map = {};
    var he_verts = [];
    this.originalVertices = vertices;

    // Parse vertices
    for (var i = 0; i < vertices.length; i+=3) {
        he_verts.push(new HE_vert(vertices[i], vertices[i+1], vertices[i+2], this.numberOfIndices++));
    };

    this.he_verts = he_verts;

    // Parse edges and faces
    for (var i = 0; i < indices.length; i+=this.numEdgesInFace) {

        var faceEdges = [];
        for (var j = 0; j < this.numEdgesInFace; j++) {
            var beginVertexIndex = (i+j);
            var endVertexIndex = i + ((j+1) % this.numEdgesInFace);

            var beginIndex = indices[beginVertexIndex];
            var endIndex = indices[endVertexIndex];

            var edge = null;
            var oppEdge = null;

            // If the edge was already created, just grab it
            if(String([beginIndex,endIndex]) in edge_indices_map) {
                edge = edge_indices_map[String([beginIndex,endIndex])];

            } else { 
            // Create an edge and its opposite
                edge = new HE_edge();
                edge.endVertex = he_verts[endIndex];
                edge.beginVertex = he_verts[beginIndex];
                
                oppEdge = new HE_edge();
                oppEdge.endVertex = he_verts[beginIndex];
                oppEdge.beginVertex = he_verts[endIndex];

                edge.oppositeEdge = oppEdge;
                oppEdge.oppositeEdge = edge;

                edge.endVertex.edges.push(edge.oppositeEdge);
                edge.oppositeEdge.endVertex.edges.push(edge);

                // If the vertex is encolsed on all sides its not a hole vertex
                if(edge.endVertex.edges.length == this.numEdgesInFace) {
                    edge.endVertex.isHoleVertex = false;
                }

                if(edge.oppositeEdge.endVertex.edges.length == this.numEdgesInFace) {
                    edge.oppositeEdge.endVertex.isHoleVertex = false;
                }

                edge_indices_map[String([beginIndex,endIndex])] = edge;
                edge_indices_map[String([endIndex,beginIndex])] = oppEdge;
            }

            faceEdges.push(edge);
        };

        // Did our created edges make an enclosing face?
        if(faceEdges.length == this.numEdgesInFace) {
            var faceForEdges = new HE_face();
            faceForEdges.edge = faceEdges[0]; // Assign any edge for the face
            faceForEdges.id = this.numberOfFaces++;
            this.faces.push(faceForEdges);

            // Assign next edges and face to all the newly created edges
            for (var j = 0; j < faceEdges.length; j++) {
                faceEdges[j].face = faceForEdges;
                faceEdges[j].nextEdge = faceEdges[(j+1) % faceEdges.length];
                if(faceEdges[j].oppositeEdge != null && faceEdges[j].oppositeEdge.face != null) {
                    faceEdges[j].isHoleEdge = false;
                }
            };
        }
  
    };

    //console.log(this.faces);
};

// Creates a face from vertices specifed in counter-clockwise order
/*Mesh.prototype.addFaces = function(v1,v2,v3,v4) {
    var faceForEdges = new HE_face();
    faceForEdges.edge = faceEdges[0]; // Assign any edge for the face
    faceForEdges.id = this.numberOfFaces++;
    this.faces.push(faceForEdges);

    // Assign next edges and face to all the newly created edges
    for (var j = 0; j < faceEdges.length; j++) {
        faceEdges[j].face = faceForEdges;
        faceEdges[j].nextEdge = faceEdges[(j+1) % faceEdges.length];
        if(faceEdges[j].oppositeEdge != null && faceEdges[j].oppositeEdge.face != null) {
            faceEdges[j].isHoleEdge = false;
        }
    };
}
*/

/*
* Deserializes mesh back into an object that can be added to the scene
* Also converts all the quads into triangles
*/
Mesh.prototype.getObjectFromMesh = function(){
    var newObject = {
    alias           : 'mesh',
    vertices        : this.originalVertices,
    indices         : [],
    diffuse         : [0.0, 0.5, 0.5, 1.0],
    wireframe       : false,
    perVertexColor  : false
    };

    for (var i = 0; i < this.faces.length; i++) {
        var face = this.faces[i];
        var verts = this.getVerticesFromFace(face);
        var triangleIndices = this.getTriangleIndicesFromQuadVerts(verts);
        newObject.indices = newObject.indices.concat(triangleIndices);
    };

    return newObject;
};

Mesh.prototype.vertexListFromHeVerts = function(verts) {
    var list = []
    for (var i = 0; i < verts.length; i++) {
        list.push(verts[i].x,verts[i].y,verts[i].z);
    };
    return list;
}

Mesh.prototype.getTriangleIndicesFromQuadVerts = function(verts) {

    if (!verts.length == 4) {
        throw "Quad not sent in Assertion failed";
    }

    // Split the quad in half diagonally into two triangles
    var triangleOne = [verts[0].index,verts[1].index,verts[2].index];
    var triangleTwo = [verts[0].index,verts[2].index,verts[3].index];
    return triangleOne.concat(triangleTwo);
};

Mesh.prototype.facePoint = function(face) {
    var verts = this.getVerticesFromFace(face);
    
    return sumVerts(verts, true);
};

Mesh.prototype.getVerticesFromFace = function(face) {
    var verts = [];
    var edge = face.edge;

    for (var i = 0; i < this.numEdgesInFace; i++) {
        verts.push(edge.endVertex);
        edge = edge.nextEdge;[i]
    };

    return verts;
};

// Warning: assumes 2 faces are avail
Mesh.prototype.edgePoint = function(edge) {

    var vertices = null;

    // For hole edges just use middle of edge
    if(edge.isHoleEdge) {
       vertices = [edge.endVertex, edge.oppositeEdge.endVertex]; 
    } else {
       vertices = [this.facePoint(edge.face),
                    this.facePoint(edge.oppositeEdge.face),
                    edge.endVertex,
                    edge.oppositeEdge.endVertex]; 
    }
    
     
    
    return sumVerts(vertices, true);
};

Mesh.prototype.vertexPoint = function(vertex) {
    
    var vertsToAvg = [];
    var faces = [];
    var edgePoints = []
    var edgePointAvg;
    for (var i = 0; i < vertex.edges.length; i++) {
        var curEdge = vertex.edges[i];
        edgePoints.push(this.edgePoint(curEdge));
    };

    edgePointAvg = sumVerts(edgePoints, true);

    if(vertex.isHoleVertex) {
        vertsToAvg = [edgePointAvg, vertex];
    } else {
        var faces = this.facesFromVertex(vertex);
        var facePoints = [];
        for (var i = 0; i < faces.length; i++) {
            facePoints.push(this.facePoint(faces[i]));
        };
        var avgFacePoint = sumVerts(facePoints, true);
        vertsToAvg = [edgePointAvg, vertex, avgFacePoint];
    }
    
    return sumVerts(vertsToAvg, true);
};

Mesh.prototype.facesFromVertex = function(vertex) {
    var edge = vertex.edge;
    var faceEdge = null;
    var faces = [];
    var isEdgeVertex = false;

    for (var i = 0; i < vertex.edges.length; i++) {     
        var possibleFaces = [vertex.edges[i].face,vertex.edges[i].oppositeEdge.face];
        var curFace = null;
        for (var k = 0; k < possibleFaces.length; k++) {
            curFace = possibleFaces[k];
        
            if(curFace) {
                var inList = false;
                for (var j = 0; j < faces.length; j++) {
                    if(faces[j].id == curFace.id) {
                        inList = true;
                        break;
                    }
                };

                if(inList == false) {
                    faces.push(curFace);
                }
            }
        };
    };

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
    //this.facePoint(this.faces[0]);
    //this.edgePoint(this.faces[0].edge.nextEdge.nextEdge);
    //this.getObjectFromMesh();
  //  console.log(this.facesFromVertex(this.faces[0].edge.nextEdge.endVertex));
    var vertex_index_map = {};

    var mesh = new Mesh();


    //First generate vertices:
    var newVertices = [];
    var newIndices = [];
    var newCurrentIndex = 0;

    //Then connect the vertices:
    for (var i = 0; i < this.faces.length; i++) {
        var face = this.faces[i];
        var verts = this.getVerticesFromFace(face);
        var indicesForFace = [];
        var edge = face.edge;
        var curIndex = 0;
        do {
            var firstVertex = this.vertexPoint(edge.beginVertex);
            var secondVertex = this.edgePoint(edge);
            var thirdVertex = this.facePoint(face);
            var finalVertex = this.edgePoint(edge.nextEdge.nextEdge.nextEdge); // For a quad, goes to final edge
            var quadVertices = [];
            quadVertices.push(firstVertex,secondVertex,thirdVertex,finalVertex);

            for (var j = 0; j < quadVertices.length; j++) {
                var vertex = quadVertices[j];

                if(String([vertex.x,vertex.y,vertex.z]) in vertex_index_map) {
                    vertex = vertex_index_map[String([vertex.x,vertex.y,vertex.z])] // We can use the same old vertex, so don't add a new vertex
                } else {
                    vertex_index_map[String([vertex.x,vertex.y,vertex.z])] = vertex; // Save the vertex
                    vertex.index = newCurrentIndex++;
                    newVertices.push(vertex);
                }

                newIndices.push(vertex.index);
            };

            edge = edge.nextEdge;
        } while(edge != face.edge);
    };


    console.log(newIndices);

    mesh.buildMesh(this.vertexListFromHeVerts(newVertices),newIndices);

    return mesh;
    //TODO: Add vertices along with indices by storing edge p
    console.log(mesh);
    
};