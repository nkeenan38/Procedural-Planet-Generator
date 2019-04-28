# version 300 es
precision highp float;

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. 

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.

uniform mat4 u_LightSpaceMatrix;

in vec4 vs_Pos;             // The array of vertex positions passed to the shader
in vec4 vs_Col1;
in vec4 vs_Col2;
in vec4 vs_Col3;
in vec4 vs_Col4;


void main()
{
    mat4 T = mat4(vs_Col1, vs_Col2, vs_Col3, vs_Col4);
    vec4 modelposition = T * u_Model * vs_Pos;   // Temporarily store the transformed vertex positions for use below
    gl_Position = u_LightSpaceMatrix * modelposition;
}