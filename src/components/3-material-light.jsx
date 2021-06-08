//第三节课：光照，阴影，材质。
import * as THREE from 'three'
import React, { useRef, useEffect, useCallback, useState } from 'react'
import EarthImage from './texture/earth.jpg'
import MoonImage from './texture/moon.jpg'
import StoneImage from './texture/guangze.jpg'
import { Camera, PerspectiveCamera } from 'three'
import { render } from '@testing-library/react'
//ref.current vs ref?
//
//useRef获取组件对象节点对象，threejs要把对象存放到canvas中，我们要获取到。
const Light = () => {
	//记录鼠标的情况
	const isDown = useRef(false)
	const body = useRef()
	const id = useRef(null)
	const floor = useRef(null)
	const angle = useRef(90) //相机初始角度为90
	const R = useRef(15) //半径为15
	//坐标轴辅助红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
	const scene = useRef(new THREE.Scene()).current //只创建一次scene不会每次都重新渲染
	const camera = useRef(new THREE.PerspectiveCamera()).current
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true })).current //会帮我们创建canvas,renderer.domElement就是返回的canvas
	//物体数组
	const projects = useRef([]).current
	//灯光数组
	const lights = useRef([]).current
	//拖拽镜头
	const mouseDown = useCallback(() => {
		isDown.current = true
		console.log(isDown)
	}, [])
	const mouseWhell = useCallback((event) => {
		//deltaY代表鼠标滑轮下滑 半径增大
		if (event.deltaY > 0) R.current += 1
		else R.current -= 1
		const y = camera.position.y
		const x = R.current * Math.cos((angle.current * Math.PI) / 180)
		const z = R.current * Math.sin((angle.current * Math.PI) / 180)
		camera.position.set(x, y, z)
		camera.lookAt(0, 0, 0)
	})
	//制造地板
	const createFloor = useCallback(() => {
		const lambert = new THREE.MeshLambertMaterial({ color: 'white' })
		const plane = new THREE.PlaneBufferGeometry(60, 60, 60)
		const mesh = new THREE.Mesh(plane, lambert)
		mesh.position.set(-6, 0, 0)
		mesh.rotation.y = (45 / 180) * Math.PI
		mesh.receiveShadow = true
		scene.add(mesh)
		floor.current = mesh
	})
	const mouseUp = useCallback(() => {
		isDown.current = false
		console.log(isDown)
	}, [])
	const mouseMove = useCallback((event) => {
		if (isDown.current === false) return
		//如果鼠标没有按下则不移动，必须要按住才行。
		//取原来的位置+要移动的位置
		//镜头移动算法
		angle.current += event.movementX * 0.1
		const y = camera.position.y + 0.1 * event.movementY
		const x = R.current * Math.cos((angle.current * Math.PI) / 180)
		const z = R.current * Math.sin((angle.current * Math.PI) / 180)
		camera.position.set(x, y, z)
		camera.lookAt(0, 0, 0)
	}, [])

	//创建所有光源
	const createAllLight = useCallback(() => {
		//创建平行光，无限远，类似于太阳光束的感觉，可以投射阴影。
		const dirLight = new THREE.DirectionalLight('white', 1)
		dirLight.position.set(100, 0, 0)
		dirLight.castShadow = true
		scene.add(dirLight)
		lights.push(dirLight)
		// //创建环境光
		// const envLight = new THREE.AmbientLight('white', 0.3)
		// scene.add(envLight)
		// lights.push(envLight)
		// //创建点光源，类似灯泡。
		// const pointLight = new THREE.PointLight('white', 1, 300)
		// pointLight.castShadow = true //开启映射
		// pointLight.position.set(0, 0, 0)
		// scene.add(pointLight)
		// lights.push(pointLight)
	})
	//创建Phong材质,有光泽，常用于金属或者玻璃的感觉，可以反光。
	const createPhong = useCallback(() => {
		var geometry = new THREE.SphereBufferGeometry(2, 32, 32)
		var texture = new THREE.TextureLoader().load(StoneImage)
		var material = new THREE.MeshPhongMaterial({ map: texture })
		var stone = new THREE.Mesh(geometry, material)

		stone.position.set(0, -4, 0)
		stone.receiveShadow = true
		stone.castShadow = true
		scene.add(stone)
		projects.push(stone)
	})
	//创建lambert材质立方体，MeshLambertMaterial对光敏感。常用于石头和木头材质。
	const createLambert = useCallback(() => {
		const lambert = new THREE.MeshLambertMaterial({ color: 'red' })
		const rect = new THREE.BoxBufferGeometry(2, 2, 2)
		const mesh = new THREE.Mesh(rect, lambert)
		mesh.position.set(0, 0, 0)
		mesh.receiveShadow = true
		mesh.castShadow = true
		scene.add(mesh)
		projects.push(mesh)
	})
	//
	//创建球体，贴纸为地球。
	const createEarth = useCallback(() => {
		var geometry = new THREE.SphereBufferGeometry(2, 32, 32)
		//Mesh是以网格形式来构造，这种材质的不受光照影响。
		var texture = new THREE.TextureLoader().load(EarthImage)
		console.log(EarthImage)
		var material = new THREE.MeshLambertMaterial({ map: texture })
		var earth = new THREE.Mesh(geometry, material)
		earth.receiveShadow = true
		earth.castShadow = true
		earth.position.set(6, 0, 0)
		scene.add(earth)
		projects.push(earth)
	}, [])
	//创建球体，贴纸为月球。
	const createMoon = useCallback(() => {
		var geometry = new THREE.SphereBufferGeometry(0.5, 32, 32)
		//Mesh是以网格形式来构造，这种材质的不受光照影响。
		var texture = new THREE.TextureLoader().load(MoonImage)
		console.log(MoonImage)
		var material = new THREE.MeshBasicMaterial({ map: texture })
		var moon = new THREE.Mesh(geometry, material)
		moon.position.set(0, 0, 6)
		scene.add(moon)
		projects.push(moon)
	}, [])
	//创建线条
	const createLine = useCallback(() => {
		const material = new THREE.LineBasicMaterial({ color: 'green' })
		const geometry = new THREE.BufferGeometry()
		const pointsArray = new Array()
		//const colorArray = new Array()
		for (let i = 0; i < 5000; i++) {
			const x = Math.random() * 2 - 1 //范围在-1到1
			const y = Math.random() * 2 - 1
			const z = Math.random() * 2 - 1
			pointsArray.push(new THREE.Vector3(x, y, z))
		}
		geometry.setFromPoints(pointsArray)
		const mesh = new THREE.Line(geometry, material)
		mesh.position.set(0, 6, 0)
		scene.add(mesh)
		projects.push(mesh)
	})
	//渲染画面
	const renderScene = useCallback(() => {
		renderer.render(scene, camera)
		projects.forEach((item) => {
			/*
        弧度为1：r跟这个角度的对应的弧长相等。即角对应的弧长跟半径的比值。
        一个圆的总弧度为2pir/r = 2pi，每一度对应的弧度就为2pi/360=pi/180。
      */
			item.rotation.y += (0.1 * Math.PI) / 180 //只转动这个就是在y=0的平面方向旋转
			item.rotation.z += (0.1 * Math.PI) / 180 //只转动这个就是在z=0的平面方向旋转
			item.rotation.x += (0.1 * Math.PI) / 180 //只转动这个就是在x=0的平面方向旋转
		})
		//每次要更新页面就会调用这个，帧循环函数。

		id.current = window.requestAnimationFrame(() => renderScene())
	}, [renderer, body])
	//设置场景的大小和相机的参数
	const init = useCallback(() => {
		renderer.setSize(body.current.offsetWidth, body.current.offsetHeight)
		renderer.shadowMap.enabled = true
		//设置相机参数
		camera.aspect = body.current.offsetWidth / body.current.offsetHeight
		camera.fov = 75
		scene.add(new THREE.AxesHelper(20))
		camera.near = 0.1
		camera.far = 1000
		camera.position.set(10, 5, 10)
		//相机的注视点，就是往哪里看,往中心原点看
		camera.lookAt(0, 0, 0)
		camera.updateProjectionMatrix()
	}, [renderer, body])
	useEffect(() => {
		//renderer.domElement就是返回的canvas
		body.current.appendChild(renderer.domElement) //将canvas添加到dom中
		init() //设置场景大小和相机的参数
		createEarth() //创建球体
		createAllLight() //创建平行光，只对光敏材料有用。
		createLambert()
		createMoon()
		createLine()
		createFloor()
		createPhong()
		renderScene() //渲染场景
		console.log('场景又被渲染了')
		return () => {
			//回收销毁资源
			console.log(id.current)
			cancelAnimationFrame(id.current)
			projects.forEach((item) => {
				scene.remove(item)
				item.geometry.dispose()
				item.material.dispose()
				item.texture.dispose()
			})
			floor.current && scene.remove(floor.current)
			lights.forEach((item) => {
				scene.remove(item)
				item.dispose()
			})
			render.dispose()
			scene.dispose()
		}
	}, [])
	return (
		<div
			onWheel={mouseWhell}
			className="page"
			ref={body}
			onMouseUp={mouseUp}
			onMouseMove={mouseMove}
			onMouseDown={mouseDown}
		></div>
	)
}
export default Light
