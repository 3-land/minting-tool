export const sleep = (t) => {
	return new Promise((res) => {
		setTimeout(res, t);
	})
}

export const nowS = ()=>(Date.now()/1000);