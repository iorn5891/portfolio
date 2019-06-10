import React from 'react';
import ReactDOM from 'react-dom';


function TodoList(props) {
	return (
		<li> <input type="button" value="削除" onClick={props.deleteClick} />{props.textValue}
		</li>
	);
}

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			todoList: ["買い物","筋トレ","プロテイン飲む","掃除"]
		}
		this.inputRef = React.createRef();
		this.addClick = this.addClick.bind(this);
	}

	renderTodoList(){
		const  todoList = this.state.todoList.map((value, index) => {
			return(
				<TodoList
					textValue={value}
					deleteClick={() => this.deleteClick(index)}
				/>
			)
		});
		return(
			<ul>{todoList}</ul>

		)
	}
	
	addClick(){
		if(this.inputRef.current.value != ""){
			let currentList = this.state.todoList.slice();
			currentList.push(this.inputRef.current.value);
			this.setState({
				todoList: currentList
			});
			this.inputRef.current.value = "";
		}
	}

	deleteClick(index){
		let deletedList = this.state.todoList.filter((v,i) => i != index);
		this.setState({
			todoList: deletedList
		});
	}
	
	
	render(){
		return (
			<div>
				<h1>TODOアプリ!!</h1>
				{this.renderTodoList()}
				<input type="text" ref={this.inputRef}/>
				<input type="button" value="追加" onClick={this.addClick} />
			</div>
		);
	}
}


//===============================

ReactDOM.render(<App />, document.getElementById('root'));
