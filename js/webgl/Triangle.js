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
                      }
}


