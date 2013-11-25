var Program = {

    /**
    * Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
    */
    getShader : function(gl, id) {
       var script = document.getElementById(id);
       if (!script) {
           return null;
       }

        var str = "";
        var k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (script.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (script.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    
    /**
    * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
    * what to do with every vertex and fragment that we pass it. 
    * The vertex shader and the fragment shader together are called the program.
    */
    load : function() {

     var fragmentShader          = Program.getShader(gl, "shader-fs");
     var vertexShader            = Program.getShader(gl, "shader-vs");
     
     prg = gl.createProgram();
     gl.attachShader(prg, vertexShader);
     gl.attachShader(prg, fragmentShader);
     gl.linkProgram(prg);

     if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
     }

     gl.useProgram(prg);

     prg.aVertexPosition  = gl.getAttribLocation(prg, "aVertexPosition");
     prg.aVertexNormal    = gl.getAttribLocation(prg, "aVertexNormal");
     prg.aVertexColor     = gl.getAttribLocation(prg, "aVertexColor");
     
     prg.uPMatrix         = gl.getUniformLocation(prg, "uPMatrix");
     prg.uMVMatrix        = gl.getUniformLocation(prg, 'uMVMatrix');
     prg.uNMatrix           = gl.getUniformLocation(prg, "uNMatrix");

    prg.uSampler = gl.getUniformLocation(prg, "uSampler");
    prg.uCubeSampler = gl.getUniformLocation(prg, "uCubeSampler");

    prg.uMaterialAmbient   = gl.getUniformLocation(prg, "uMaterialAmbient"); 
    prg.uMaterialSpecular  = gl.getUniformLocation(prg, "uMaterialSpecular");
    prg.uShininess          = gl.getUniformLocation(prg, "uShininess");
    prg.uMaterialDiffuse  = gl.getUniformLocation(prg, "uMaterialDiffuse");

    prg.uLightPosition      = gl.getUniformLocation(prg, "uLightPosition");
    prg.uLightDiffuse     = gl.getUniformLocation(prg, "uLightDiffuse");
    prg.uLightSpecular     = gl.getUniformLocation(prg, "uLightSpecular");
    prg.uLightAmbient      = gl.getUniformLocation(prg, "uLightAmbient");

    gl.uniform3fv(prg.uLightPosition,[4.5,3.0,15.0]);        
    gl.uniform4fv(prg.uLightAmbient, [0.7,0.7,0.7,1.0]);
    gl.uniform4fv(prg.uLightDiffuse,  [1.0,1.0,1.0,1.0]); 
    gl.uniform4fv(prg.uLightSpecular,  [1.0,1.0,1.0,1.0]);
    gl.uniform4fv(prg.uMaterialAmbient, [1.0,1.0,1.0,1.0]); 
    gl.uniform4fv(prg.uMaterialDiffuse, [0.5,0.8,0.1,1.0]);
    gl.uniform4fv(prg.uMaterialSpecular,[1.0,1.0,1.0,1.0]);
    gl.uniform1f(prg.uShininess, 200.0);

    }
}