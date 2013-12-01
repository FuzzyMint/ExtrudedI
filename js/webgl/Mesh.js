
/**
*   Mesh
*/
function Mesh() {
    "use strict";

    this.faces = [];
    this.originalVertices = [];
    this.numEdgesInFace = 4;
}

function HE_vert(x, y, z, index) {
    "use strict";

    this.x = x;
    this.y = y;
    this.z = z;
    this.index = index;
    this.vertexPoint = null;

    this.edges = [];
    this.faces = [];

    this.isHoleVertex = function() {
        return this.edges.length != this.faces.length;
    }

    this.print = function() {
        console.log("(" + x + ', ' + y + ', ' + z + ')');
    }
}

function HE_edge(beginVertex, endVertex) {
    "use strict";

    this.beginVertex = beginVertex;
    this.endVertex = endVertex;
    this.faces = [];
    this.edgePoint = null;

    this.isHoleEdge = function() {
        return this.faces.length == 1;
    }
}

function HE_face() {
    "use strict";

    this.vertices = [];
    this.edges = [];
    this.facePoint = null;
}

/*
* Serializes vertex and index list into a mesh by populating our mesh data structure
*/
Mesh.prototype.buildMesh = function(vertices,indices) {
    this.originalVertices = vertices;
    var edge_indices_map = {};
    var he_verts = [];

    // Parse vertices
    var index = 0;
    for (var i = 0; i < vertices.length; i+=3) {
        he_verts.push(new HE_vert(vertices[i], vertices[i+1], vertices[i+2],index++));
    };

    // Parse edges and faces
    for (var i = 0; i < indices.length; i+=this.numEdgesInFace) {

        var faceForEdges = new HE_face();

        for (var j = 0; j < this.numEdgesInFace; j++) {
            var beginVertexIndex = (i+j);
            var endVertexIndex = i + ((j+1) % this.numEdgesInFace);

            var beginIndex = indices[beginVertexIndex];
            var endIndex = indices[endVertexIndex];

            var beginVertex = he_verts[beginIndex];
            var endVertex = he_verts[endIndex];

            var edge = new HE_edge(beginVertex,endVertex);;

            // First time traversing edge, doesn't get called on new edges in other direction ex: 10 - 01 counts as 1 edge for begin and end vertex
            if(!(String([beginIndex,endIndex]) in edge_indices_map)) {
                edge_indices_map[String([beginIndex,endIndex])] = edge;
                edge_indices_map[String([endIndex,beginIndex])] = edge;
                beginVertex.edges.push(edge);
                endVertex.edges.push(edge);
            }

            edge.faces.push(faceForEdges);
            faceForEdges.edges.push(edge);
        };
        
        // Assign vertices to face
        for (var j = 0; j < faceForEdges.edges.length; j++) {
            var curEdgeBeginVertex = faceForEdges.edges[j].beginVertex;
            faceForEdges.vertices.push(curEdgeBeginVertex);
            curEdgeBeginVertex.faces.push(faceForEdges);
        };

        this.faces.push(faceForEdges);
    };

};

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
        var triangleIndices = this.getTriangleIndicesFromQuadVerts(face.vertices);
        newObject.indices = newObject.indices.concat(triangleIndices);
    };

    return newObject;
};

/*
* Creates two triangles(indices) from a specified quad of vertices
*/
Mesh.prototype.getTriangleIndicesFromQuadVerts = function(verts) {

    if (!verts.length == 4) {
        throw "Quad not sent in Assertion failed";
    }

    var triangleOne = [verts[0].index,verts[1].index,verts[2].index];
    var triangleTwo = [verts[0].index,verts[2].index,verts[3].index];
    return triangleOne.concat(triangleTwo);
};

Mesh.prototype.facePoint = function(face) {
    if(face.facePoint != null) {
        return face.facePoint;
    } 

    face.facePoint = averageVerts(face.vertices);
    return face.facePoint;
};

Mesh.prototype.edgePoint = function(edge) {

    if(edge.edgePoint != null) {
        return edge.edgePoint;
    }

    var vertices = [];
    if(edge.isHoleEdge()) {
       vertices = [edge.beginVertex, edge.endVertex]; 
    } else {
       vertices = [this.facePoint(edge.faces[0]),
                    this.facePoint(edge.faces[1]),
                    edge.beginVertex,
                    edge.endVertex]; 
    }
    
    edge.edgePoint = averageVerts(vertices);
    return edge.edgePoint;
};

Mesh.prototype.vertexPoint = function(vertex) {

    if(vertex.vertexPoint != null) {
        return vertex.vertexPoint;
    }

    var oldVertex = new HE_vert(vertex.x,vertex.y,vertex.z);
    var vertsToAvg = [];
    var faces = [];
    var middleEdgePoints = [];
    var n = vertex.faces.length;
    var m1 = (n - 3) / n;
    var m2 = 1 / n;
    var m3 = 2 / n;

    for (var i = 0; i < vertex.edges.length; i++) {
        var curEdge = vertex.edges[i];
        middleEdgePoints.push(averageVerts([curEdge.beginVertex,curEdge.endVertex]));
    };

    var middleEdgeAvgs = averageVerts(middleEdgePoints);

    if(vertex.isHoleVertex()) {
        vertsToAvg = [middleEdgeAvgs, oldVertex];
        vertex.vertexPoint = averageVerts(vertsToAvg);
    } else {
        var facePoints = [];
        for (var i = 0; i < vertex.faces.length; i++) {
            facePoints.push(this.facePoint(vertex.faces[i]));
        };
        var avgFacePoint = averageVerts(facePoints);

        oldVertex.x *= m1;
        oldVertex.y *= m1;
        oldVertex.z *= m1;

        avgFacePoint.x *= m2;
        avgFacePoint.y *= m2;
        avgFacePoint.z *= m2;

        middleEdgeAvgs.x *= m3;
        middleEdgeAvgs.y *= m3;
        middleEdgeAvgs.z *= m3;

        vertsToSum = [middleEdgeAvgs, oldVertex, avgFacePoint];
        vertex.vertexPoint = sumVerts(vertsToSum);
    }
    
    return vertex.vertexPoint;
};


function averageVerts(vertArray) {
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    for (var i = vertArray.length - 1; i >= 0; i--) {
        sumX += vertArray[i].x;
        sumY += vertArray[i].y;
        sumZ += vertArray[i].z;
    };

    sumX /= vertArray.length;
    sumY /= vertArray.length;
    sumZ /= vertArray.length;

    return new HE_vert(sumX,sumY,sumZ);
};

function sumVerts(vertArray) {
    var sumX = 0;
    var sumY = 0;
    var sumZ = 0;

    for (var i = vertArray.length - 1; i >= 0; i--) {
        sumX += vertArray[i].x;
        sumY += vertArray[i].y;
        sumZ += vertArray[i].z;
    };

    return new HE_vert(sumX,sumY,sumZ);
};

// Generates and returns new mesh after running Catmull-Clark subdivision.
Mesh.prototype.catmull = function() {
    var vertex_index_map = {};

    var mesh = new Mesh();

    //First generate vertices:
    var newVertices = [];
    var newIndices = [];
    var newCurrentIndex = 0;

    //Then connect the vertices:
    for (var i = 0; i < this.faces.length; i++) {
        var face = this.faces[i];
        var indicesForFace = [];
        for (var k = 0; k < this.numEdgesInFace; k++) {
            var edge = face.edges[k];
            var previousEdge = face.edges[(k+this.numEdgesInFace-1) % this.numEdgesInFace];

            var firstVertex = this.vertexPoint(edge.beginVertex);
            var secondVertex = this.edgePoint(edge);
            var thirdVertex = this.facePoint(face);
            var finalVertex = this.edgePoint(previousEdge); // For a quad, goes to final edge
            var quadVertices = [];
            quadVertices.push(firstVertex,secondVertex,thirdVertex,finalVertex);

            for (var j = 0; j < quadVertices.length; j++) {
                var vertex = quadVertices[j];
                var vertexKey = String([vertex.x,vertex.y,vertex.z])

                if(vertexKey in vertex_index_map) {
                    vertex = vertex_index_map[vertexKey] // We can use the same old vertex, so don't add a new vertex
                } else {
                    vertex_index_map[vertexKey] = vertex; // Save the vertex
                    vertex.index = newCurrentIndex++;
                    newVertices.push(vertex);
                }

                newIndices.push(vertex.index);
            }
        }
    }

    mesh.buildMesh(this.vertexListFromHeVerts(newVertices),newIndices);

    return mesh;    
};

// Flattens vertices into an array of coordinates
Mesh.prototype.vertexListFromHeVerts = function(verts) {
    var list = []
    for (var i = 0; i < verts.length; i++) {
        list.push(verts[i].x,verts[i].y,verts[i].z);
    };
    return list;
};