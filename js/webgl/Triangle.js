var Triangle = {
    alias           : 'axis',
    dim             : 5,
    vertices        : [1,0.0,0.0, 0.0,1,0.0, 0.0,0.0,1],
    indices         : [0,1,2],
    colors          : [	1, 1, 0 ,1,	  1, 1, 0 ,1,	0, 1 ,0 ,1,	 0, 1 ,0 ,1,  0, 0, 1 ,1,	 0, 0, 1 ,1	],
    wireframe       : false,
    perVertexColor  : true,
    build           : function(d){
                        if (d) Triangle.dim = d;
                        Triangle.vertices = [d,0.0,0.0, 0.0,d,0.0, 0.0,0.0,d];
                      }
}


