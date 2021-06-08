//第一节课：起始场景的设置。
import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'
import { PerspectiveCamera } from 'three'
//useRef获取组件对象节点对象，threejs要把对象存放到canvas中，我们要获取到。
const Start = () => {
	const body = useRef()
	const scene = useRef(new THREE.Scene()).current //只创建一次scene不会每次都重新渲染
	const camera = useRef(
		new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
	).current
	const renderer = useRef(new THREE.WebGL1Renderer()).current //会帮我们创建canvas
	//物体数组
	const meshs = useRef([]).current
	useEffect(() => {
		//renderer.domElement就是返回的canvas
		body.current.appendChild(renderer.domElement)
	}, [])
	return <div className="page" ref={body}></div>
}
export default Start
