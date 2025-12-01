import { makeAutoObservable } from 'mobx'
import { mobxState } from 'mobx-toolbox'

class CounterStore {
	constructor() { makeAutoObservable(this) }

	count = mobxState(0)('count')
	decrement = () => this.count.setCount(p => p - 1)
}
const counterStore = new CounterStore()

describe("Counter tests", () => {
	it("should decrement count", () => {
		console.log(counterStore.count.count)
		counterStore.count.setCount(666)
		console.log(counterStore.count.count)
		counterStore.decrement()
		console.log(counterStore.count.count)
		expect(counterStore.count.count).toBe(665)
	})
})
