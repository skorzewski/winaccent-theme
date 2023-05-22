// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as Color from 'color';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Registry } from 'winreg-ts';
import template from './template';
const rgblab = require('rgb-lab');


function componentToHex(c: number) {
	var hex = Math.round(c).toString(16);
	return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(rgb: Array<number>) {
	return componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function hexToRgb(hex: string) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// Register the update command
	let disposable = vscode.commands.registerCommand('winaccentTheme.update', generateColorTheme);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }


function generateColorTheme() {
	var color: Color = Color("#ff0000");
	const defaultColor = "0078d4";
	const regKey = new Registry({
		hive: Registry.HKCU,
		key: '\\Software\\Microsoft\\Windows\\DWM',
		utf8: true
	});
	var hex = defaultColor;
	regKey.get("ColorizationColor", function (err, item) {
		if (err) { throw err; }
		var colorizationColor: string = item?.value.substring(4) || defaultColor;
		var colorizationLAB = rgblab.rgb2lab(hexToRgb(colorizationColor));
		var defaultLAB = rgblab.rgb2lab(hexToRgb(defaultColor));
		var l = defaultLAB[0];
		var a = colorizationLAB[1];
		var b = colorizationLAB[2];
		var rgb = rgblab.lab2rgb([l, a, b]);
		hex = "#" + rgbToHex(rgb);
		color = Color(hex);
		const colorTheme = template(color);
		fs.writeFileSync(path.join(__dirname, '..', 'themes', 'winaccent.json'), JSON.stringify(colorTheme, null, 4));
		console.log('Theme updated with accent color ' + hex);
	});
}
