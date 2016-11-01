import React from 'react';
import request from 'superagent';
import makeRule from 'makerule';
import Deferred from 'd.js';

const validateEmail = makeRule.rule().isString().isEmail().required();
const validateName = makeRule.rule().isString().required().longerThan(0);

function doAPIRequestForMembers(name, email) {
	let d = Deferred();
	request.get('/meetupInfo.php')
		.end((err, res) => {
			 if(err) return d.reject(err);
			 return d.resolve(res);
		});
	return d.promise;
};

// lol an "api" request
function doAPIRequestForForm(name, email) {
	let d = Deferred();
	request.post('/inviteToSlack.php')
		.type('form')
		.send({ name, email })
		.end((err, res) => {
			if(err) return d.reject(err);
			 return d.resolve(res);
		});
	return d.promise;
};

export default React.createClass({

	getInitialState() {
		return {
			fenderNumber: false,
			loading: false,
			submitted: false,
			submitError: false,
			name: "",
			nameError: false,
			email: "",
			emailError: false
		};
	},	

	componentDidMount() {
		doAPIRequestForMembers()
			.then(result => {
				let response = JSON.parse(result.text);
				this.setState({ fenderNumber: 954 });
			})
			.error(error => {
				this.setState({ fenderNumber: '900+' });
			});
	},	

	handleEmailChange(e) {
		let email = e.target.value;
		this.setState({ email });
	},

	handleEmailBlur(e) {
		// if the email validates incorrectly, then shut it down.
		let email = e.target.value;
		this.doEmailValidation(email);
	},

	doEmailValidation(email) {
		const validation = validateEmail(email);
		if (!validation.result) { 
			this.setState({ 
				emailError : "Sorry, looks like you've entered an incorrectly formatted email... do you mind fixing it up?" 
			});
		} else {
			this.setState({ emailError: false });
		}
		return validation;
	},

	handleNameBlur(e) {
		let name = e.target.value;
		this.doNameValidation(name);
	},

	doNameValidation(name) {
		const validation = validateName(name);
		if (!validation.result) { 
			this.setState({ 
				nameError : "Sorry, we need your name before signing you up!" 
			});
		} else {
			this.setState({ nameError: false });
		}
		return validation;
	},

	handleNameChange(e) {
		let name = e.target.value;
		this.setState({ name });
	},

	handleSubmit(e) {
		e.preventDefault();

		let { name, email } = this.state;

		let emailValidation = this.doEmailValidation(email);
		let nameValidation = this.doNameValidation(name);

		if (!emailValidation.result || !nameValidation.result) {
			return false;
		}
		
		this.setState({ submitted: false, nameError: false, submitError: false, emailError: false, loading: true });
		
		doAPIRequestForForm(name, email)
			.then(result => this.handleSubmitSuccess(result))
			.error(error => this.handleSubmitError(error));
	},

	handleSubmitSuccess(result) {
		this.setState({
			loading: false,
			submitted: true,
			fenderNumber: ++this.state.fenderNumber
		});
	},

	handleSubmitError(error) {
		console.log(error);
		this.setState({
			submitError: "Sorry, we had some trouble submitting this form... please refresh your page and try again. If that doesn't work please get in contact with us.",
			loading: false,
			name: "",
			email: ""
		});
	},

	render() {

		if (this.state.submitError) return <form className="join clearfix" action="" method="post" onSubmit={this.handleSubmit}>
			<div className="validation-error" style={{ 'marginBottom': 0, 'marginTop' : 0 }}>{this.state.submitError}</div>
		</form>;

		return <form className={`join clearfix ${(this.state.loading && 'loading') || ''}`} action="" method="post" onSubmit={this.handleSubmit}>

			{this.state.loading && <div className="loader">Loading...</div>}

			<legend>
				{(() => {
					if (!this.state.submitted) {
						return <span>Join the convo with <span className="legend-note">{this.state.fenderNumber || '...'}</span> other Fenders on Slack!</span>
					}
					// printing here because of weird symbols - I forget how to do this for reals
					return <span className="success">{`Invitation sent. We're excited to meet you :)`}</span>;
				})()}
			</legend>

			<label>
				<span className="hidden">Your Name</span>
				<input 
					type="text" 
					name="name" 
					value={this.state.name}
					placeholder="Your Name" 
					className={`required ${(this.state.nameError ? 'error' : '')}`} 
					aria-required="true" 
					onChange={this.handleNameChange}
					onBlur={this.handleNameBlur} />
					{this.state.nameError &&
						<div className="validation-error">{this.state.nameError}</div>
					}
			</label>

			<label>
				<span className="hidden">Email Address</span>
				<input 
					type="email" 
					name="email" 
					value={this.state.email}
					placeholder="Email address" 
					className={`required email ${(this.state.emailError ? 'error' : '')}`} 
					aria-required="true" 
					onChange={this.handleEmailChange} 
					onBlur={this.handleEmailBlur} />
					{this.state.emailError &&
						<div className="validation-error">{this.state.emailError}</div>
					}
			</label>

			<button className="btn" type="submit">Get me in!</button>

		</form>
	}

});
