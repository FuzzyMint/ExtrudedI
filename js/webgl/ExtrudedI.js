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
                      0.5, -1.0, 0.0,
                      0.5, -0.5, 0.0,
                      0.2, -0.5, 0.0, 
                      0.2, 0.5, 0.0,
                      0.5, 0.5, 0.0,
                      0.5, 1.0, 0.0,
                      ],
    indices         : [
                       0, 1, 2,
                       9, 10, 11,
                       0, 9, 11,
                       0, 2, 9,
                       4, 3, 5,
                       5, 3, 6,
                       8, 7, 6,
                       3, 8, 6,
                       2, 9, 8,
                       2, 3, 8,
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

                        for(var l=0; l<ExtrudedI.indices.length; l+=3){
                            i[l] = 12 + ExtrudedI.indices[l];
                            i[l+1] = 12 + ExtrudedI.indices[l+1];
                            i[l+2] = 12 + ExtrudedI.indices[l+2]; 
                        }

                        var indexCount = 0;
                        for(var l=0; l<ExtrudedI.indices.length; l+=3){
                            connectingIndices[indexCount] = ExtrudedI.indices[l]
                            connectingIndices[indexCount+1] = ExtrudedI.indices[l+1]
                            connectingIndices[indexCount+2] = ExtrudedI.indices[l] + 12

                            connectingIndices[indexCount+3] = connectingIndices[indexCount+1] + 12
                            connectingIndices[indexCount+4] = connectingIndices[indexCount+1]
                            connectingIndices[indexCount+5] = connectingIndices[indexCount+2]

                            connectingIndices[indexCount+6] = connectingIndices[indexCount+3]
                            connectingIndices[indexCount+7] = connectingIndices[indexCount+4]
                            connectingIndices[indexCount+8] = ExtrudedI.indices[l+2]

                            connectingIndices[indexCount+9] = connectingIndices[indexCount+6]
                            connectingIndices[indexCount+10] = ExtrudedI.indices[l+2] + 12
                            connectingIndices[indexCount+11] = ExtrudedI.indices[l+2]

                            indexCount += 12;
                        }

                        //Connect the top and bottom
                        topAndBottomFaceIndices = [0,11,12,11,12,23];
                        

                        console.log('Original:   ' + ExtrudedI.indices);
                        console.log('Connecting: ' + connectingIndices);
                        //console.log(i);

                     
                        ExtrudedI.vertices = ExtrudedI.vertices.concat(v);

                        for(var l=0; l<ExtrudedI.vertices.length; l+=3){
                            ExtrudedI.vertices[l+1] += 1.0
                            ExtrudedI.vertices[l+2] -= 0.25;
                        }

                        ExtrudedI.indices = ExtrudedI.indices.concat(i).concat(connectingIndices).concat(topAndBottomFaceIndices);


                        //ExtrudedI.vertices = v;
                        //ExtrudedI.indices = i;
                      }
}


