//第二节课：渲染月球和地球。
import * as THREE from 'three'
import React, { useRef, useEffect, useCallback } from 'react'
import EarthImage from './texture/earth.jpg'
import MoonImage from './texture/moon.jpg'
import { PerspectiveCamera } from 'three'
import { render } from '@testing-library/react'
//useRef获取组件对象节点对象，threejs要把对象存放到canvas中，我们要获取到。
const Start = () => {
	const body = useRef()
  const id = useRef(null)
  console.log("id:"+id)
	//坐标轴辅助红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
	const axes = new THREE.AxesHelper(100)
	const scene = useRef(new THREE.Scene()).current //只创建一次scene不会每次都重新渲染
	const camera = useRef(new THREE.PerspectiveCamera()).current
	const renderer = useRef(new THREE.WebGL1Renderer({ antialias: true })).current //会帮我们创建canvas,renderer.domElement就是返回的canvas
	//物体数组
	const projects = useRef([]).current
	//创建球体，贴纸为地球。
	const createEarth = useCallback(() => {
		var geometry = new THREE.SphereBufferGeometry(2, 32, 32)
		//Mesh是以网格形式来构造，这种材质的不受光照影响。
		var texture = new THREE.TextureLoader().load(EarthImage)
		console.log(EarthImage)
		var material = new THREE.MeshBasicMaterial({ map: texture })
		var earth = new THREE.Mesh(geometry, material)
		earth.position.set(6, 0, 0)
		scene.add(earth)
		projects.push(earth)
		scene.add(axes)
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
		scene.add(axes)
	}, [])
  //创建线条
  const createLine = useCallback(()=>{
    const material = new THREE.LineBasicMaterial({color:'green'})
    const geometry = new THREE.BufferGeometry()
    const pointsArray = new Array()
    //const colorArray = new Array()
    for(let i = 0;i<5000;i++){
      const x = Math.random() * 2 - 1 //范围在-1到1
      const y = Math.random() * 2 - 1
      const z = Math.random() * 2 - 1
      pointsArray.push(new THREE.Vector3(x,y,z))
    }   
    geometry.setFromPoints(pointsArray)
    const mesh = new THREE.Line(geometry,material)
    mesh.position.set(0,6,0)
    scene.add(mesh)
    projects.push(mesh)
    console.log("line现在已经被添加")
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
			item.rotation.x += (0.1 * Math.PI) / 180//只转动这个就是在x=0的平面方向旋转
		})
		//每次要更新页面就会调用这个，帧循环函数。
		id.current = window.requestAnimationFrame(() => renderScene())
	}, [renderer, body])
	//设置场景的大小和相机的参数
	const init = useCallback(() => {
		renderer.setSize(body.current.offsetWidth, body.current.offsetHeight)
		//设置相机参数
		camera.aspect = body.current.offsetWidth / body.current.offsetHeight
		camera.fov = 75

		camera.near = 0.1
		camera.far =1000
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
		createMoon()
    createLine()
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
      render.dispose()
			scene.dispose()
		}
	}, [])
	return <div className="page" ref={body}></div>
}
export default Start
