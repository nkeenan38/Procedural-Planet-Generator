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


void main()
{
    gl_Position = u_LightSpaceMatrix * u_Model * vs_Pos;
}
