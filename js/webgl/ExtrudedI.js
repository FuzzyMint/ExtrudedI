var ExtrudedI = {
    alias           : 'I',
    dim             : 10,
    vertices        : [
                      -0.5, 1.0, 0.0,
                      -0.5, 0.5, 0.0,
                      -0.2, 0.5, 0.0,
                      -0.2, -0.5, 0.0,
                      -0.5, -0.5, 0.0,
                      -0.5, -1.0, 0.0,
                      -0.2, -1.0, 0.0,
                      0.2, -1.0, 0.0,
                      0.5, -1.0, 0.0,
                      0.5, -0.5, 0.0,
                      0.2, -0.5, 0.0,
                      0.2, 0.5, 0.0,
                      0.5, 0.5, 0.0,
                      0.5, 1.0, 0.0,
                      0.2, 1.0, 0.0,
                      -0.2, 1.0, 0.0
                      ],
    indices         : [
                       0,1,2,15,
                       15,2,11,14,
                       14,11,12,13,
                       2,3,10,11,
                       4,5,6,3,
                       3,6,7,10,
                       10,7,8,9
                     ],
    diffuse         : [0.0, 0.5, 0.5, 1.0],
    wireframe       : false,
    perVertexColor  : false,
    build           : function(){
                        var v = [];
                        var i = [];
                        var connectingIndices = [];

                        for(var l=0; l<ExtrudedI.vertices.length; l+=3){
                            v[l] = ExtrudedI.vertices[l];
                            v[l+1] = ExtrudedI.vertices[l+1];
                            v[l+2] = 0.5;  
                        }

                        var offset = ExtrudedI.vertices.length/3;
                        for(var l=0; l<ExtrudedI.indices.length; l+=4){
                            i[l] = offset + ExtrudedI.indices[l];
                            i[l+1] = offset + ExtrudedI.indices[l+1];
                            i[l+2] = offset + ExtrudedI.indices[l+2]; 
                            i[l+3] = offset + ExtrudedI.indices[l+3]; 
                        }

                        var indexCount = 0;
                        var indexer = 0;
                        for(var l=0; l<offset; l++){
                            connectingIndices[indexCount] = l;
                            connectingIndices[indexCount+1] = (l+1) % offset;
                            connectingIndices[indexCount+2] = (l+1) % offset + offset;
                            connectingIndices[indexCount+3] = l % offset + offset;

                            indexCount += 4;
                        }
                     
                        ExtrudedI.vertices = ExtrudedI.vertices.concat(v);
                        //Shift
                        for(var l=0; l<ExtrudedI.vertices.length; l+=3){
                            ExtrudedI.vertices[l+1] += 1.0
                            ExtrudedI.vertices[l+2] -= 0.25;
                        }

                        ExtrudedI.indices = ExtrudedI.indices.concat(i).concat(connectingIndices);
                      }
}


