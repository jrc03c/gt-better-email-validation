let fs = require("fs")
let gt = require("gt-helpers")

async function build(){
	let handleValids = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_+"
	let domainValids = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-"

	let temp = {}
	handleValids.split("").forEach(v => temp[v] = 1)
	handleValids = gt.object.toAssociation(temp)

	temp = {}
	domainValids.split("").forEach(v => temp[v] = 1)
	domainValids = gt.object.toAssociation(temp)

	let tests = ""
	let testEmails = {
		"someone@example.com": true,
		"s.o.m.e.o.n.e@e.x.a.m.p.l.e.c.o.m": true,
		"someone+test@example.com": true,
		"someone@example+test.com": false,
		"someone_test@example.com": true,
		"someone@example_test.com": false,
		"someone@example-test.com": true,
		"_someone@example.com": false,
		"someone_@example.com": false,
		"someone@-example.com": false,
		"someone@example-.com": false,
		"someone@example": false,
		"someone.com": false,
	}

	Object.keys(testEmails).forEach(function(email){
		let shouldPass = testEmails[email]

		tests += `
			>> betterEmailValidationInput = "${email}"
			*program: Better Email Validation
			*if: betterEmailValidationOutput = ${shouldPass ? '"yes"' : '"no"'}
				*component
					*classes: alert alert-success
					PASSED "${email}"!
			*if: not (betterEmailValidationOutput = ${shouldPass ? '"yes"' : '"no"'})
				*component
					*classes: alert alert-danger
					FAILED "${email}"!
		`
	})

	let data = {
		handleValids,
		domainValids,
		tests,
	}

	let template = fs.readFileSync("program-template.gt", "utf8")
	let out = await gt.template.liquidBuild(template, data)
	fs.writeFileSync("program.gt", out, "utf8")

	let testsTemplate = fs.readFileSync("tests-template.gt", "utf8")
	let testsOut = await gt.template.liquidBuild(testsTemplate, data)
	fs.writeFileSync("tests.gt", testsOut, "utf8")
}

build()
