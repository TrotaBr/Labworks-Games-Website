import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'

const scenePath = '/models/scene.gltf'

export const LoadGLTFByPath = (scene, manager) => {

  return new Promise((resolve, reject) => {

    // 👇 Pass the manager here
    const loader = new GLTFLoader(manager)

    loader.load(
      scenePath,

      (gltf) => {
        scene.add(gltf.scene)
        resolve()
      },

      undefined,

      (error) => {
        reject(error)
      }
    )

  })
}
