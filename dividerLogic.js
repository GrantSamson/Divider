//Get page objects
/* digit box navigation
Answer bar: boxes 0-3
Remainder: boxes 4,5
Denominator: boxes 6,7
Numerator: boxes 8-11
*/
const digitBoxes = document.querySelectorAll('.digit-box');
const msgBox = document.getElementById('messages');
const confirmBtn = document.getElementById('confirm');
const queryBox = document.getElementById('queryInput');

const RESET = -1;
const INPUT_NUMERATOR = 0;
const INPUT_DENOMINATOR = 1;
const PARTIAL_QUOTIENT_REQUEST = 2;
const FIND_PARTIAL_PRODUCT = 3;
const SUBTRACT_PARTIAL_PRODUCT = 4;
const VALIDATE_QUOTIENT_CHECK_REMAINDER = 5;
const FINAL_ANSWER_CONFIRMATION = 6;

//step counter for division tutorial
let stepCounter = 0;
let numerator = 0;
let numeratorString = "";
let denominator = 0;
let currentCol = 0;
let curAnsRow = 0;
let zeroShortCircuit = false;
/*
   cA
  )‾‾‾‾‾‾
d )nu
   ts
*/
let partialProduct = 0; //Current working product, for math steps
let partialQuotent = 0; //Current working quotient, supplied answer by student for current digit
let intermediateRemainder = 0;

// Add listner for enter key, allowing this instead of manually clicking.
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    doDivision();
  }
});

///////////////////////////////////////////////////////////////
// Main program logic - broken into steps as it's user driven
  function doDivision(){
  
    switch(stepCounter){
      //////////////////////////////////////////////
	  // Query user for numerator.
      case 0:
        eraseMsg();
		clearQueryBox();
		queryBox.style.visibility = "visible";
        addMsg("What's your numerator?");
		digitBoxes[8].classList.add('highlight');
		digitBoxes[9].classList.add('highlight');
		digitBoxes[10].classList.add('highlight');
		digitBoxes[11].classList.add('highlight');
        break;
	  
	  //////////////////////////////////////////////
	  // Validate numerator and request denominator
	  case 1:
	    //Validate numerator input
		if(!isValidInput(4))
		  break;
		
		//Get numerator value
		numerator = queryBox.value;
		numeratorString = queryBox.value + "   ";
		
		if(numerator < 0){
		  addMsg("Please pick a positive numerator.");
		  stepCounter -= 1;
		  break;
		}
		
		//Display the numerator
		digitBoxes[8].classList.remove('highlight');
		digitBoxes[9].classList.remove('highlight');
		digitBoxes[10].classList.remove('highlight');
		digitBoxes[11].classList.remove('highlight');
		
		digitBoxes[8].innerHTML = numeratorString[0];
		digitBoxes[9].innerHTML = numeratorString[1];
		digitBoxes[10].innerHTML = numeratorString[2];
		digitBoxes[11].innerHTML = numeratorString[3];
		
		//Numerator is legit, lets get going!
	    eraseMsg();
		clearQueryBox();
		addMsg("What's your denominator?");
		digitBoxes[6].classList.add('highlight');
		digitBoxes[7].classList.add('highlight');

	    break;
	
      //////////////////////////////////////////////
	  // Validate denominator and move forward.
	  // begin 1st digit answer check.
	  case 2:
	    //Validate denominator input
		if(!isValidInput(2))
		  break;
		
		//Get denominator value
		denominator = queryBox.value;
		var temp = queryBox.value + " ";
		
		//NO DIVIDING BY 0!
		if(denominator == 0){
		  addMsg("You cannot divide by 0 without destroying the world. Pick another denominator.");
		  stepCounter -= 1;
		  break;
		}
		
		if(denominator < 0){
		  addMsg("We're not dividing negatives, please input a positive number");
		  stepCounter -= 1;
		  break;
		}
		
		//Display denominator
		if(denominator < 10){
		  digitBoxes[7].innerHTML = temp[0];
		}
		else{
		  digitBoxes[6].innerHTML = temp[0];
		  digitBoxes[7].innerHTML = temp[1];
		}
		
		//Unhighlight selected numbus
		digitBoxes[6].classList.remove('highlight');
		digitBoxes[7].classList.remove('highlight');
		
		//Denominator is legit, lets get going!
	    eraseMsg();
		clearQueryBox();
		partialProduct = numeratorString[0] * 1;
		addMsg(`So... how many times does ${denominator} go into ${partialProduct}?`);
		digitBoxes[0].classList.add('highlight');
	    break;
	
	  //We're getting our first answer, but we're not done at just the input
	  //Selected input must be checked for validity; create function?
	  case 3:
	    //validate first answer digit input
		if(!isValidInput(1))
		  break;
		
		//get answer value
		partialQuotent = queryBox.value * 1;
		digitBoxes[currentCol].innerHTML = partialQuotent;
		
		//1st digit 2 digit denominator check - This should be obvious.
		if(currentCol == 0 && partialQuotent > 0 && denominator > 9){
			addMsg(`Think. Can a 2 digit number ${denominator} go into ${partialProduct}? Try again.`)
			stepCounter -= 1;
			break;
		}
		
		//== 0 check shortcircuit ==
		//we don't need to have the student go through the whole process if the denominator is bigger than the current tested number.
		if(partialProduct < denominator && partialQuotent == 0){
			addMsg(`Yes, ${denominator} is greater than ${partialProduct} so we move on.`)
			intermediateRemainder = 0; //Set this to 0.
			stepCounter = VALIDATE_QUOTIENT_CHECK_REMAINDER; //Skip subtraction operation.
			zeroShortCircuit = true;
			doDivision();
			return;
		}
		
		//Validate multiplication step
		clearQueryBox();
		addMsg(`Ok, what is ${partialQuotent} * ${denominator}?`)
		
		digitBoxes[currentCol].classList.remove('highlight');
		digitBoxes[currentCol].classList.add('remember');
		
		//highlight product row
		var adjHighlightSelect = 12+currentCol+(curAnsRow*8);
		digitBoxes[adjHighlightSelect].classList.add('highlight');
		
		if(partialProduct > 9)
			digitBoxes[adjHighlightSelect-1].classList.add('highlight');
		if(partialProduct > 99)
			digitBoxes[adjHighlightSelect-2].classList.add('highlight');
		
		break;

      /* Now we're checking for successful multiplication of the current answer by the denominator. For 2 digit numbers this can get a bit tricky.
	  */
	  case 4:	  
		if(denominator > 9){
			if(!isValidInput(3))
				break;
		}
		else{
			if(!isValidInput(2))
				break;
		}
		
		//get answer value
		temp = queryBox.value * 1;
		
		// If their partial product answer is wrong then...
		if(temp != partialQuotent * denominator)
		{
		  addMsg("No. That's not right. Try again.");
			
		  stepCounter -= 1;
		  clearQueryBox();
		  break;
		}
		
		//Box highlighting now!
		var adjHighlightSelect = 12 + currentCol + (curAnsRow * 8);
		
		var ansStr = "" + temp;
		var adjPosition = adjHighlightSelect-(ansStr.length-1);
		for(var i = 0; i < ansStr.length; i++){
			digitBoxes[adjPosition+i].innerHTML = ansStr[i];
			digitBoxes[adjPosition+i].classList.add('remember');
			digitBoxes[adjPosition+i+4].classList.add('highlight');
		}
		
		//Validate multiplication step
		intermediateRemainder = temp;
		clearQueryBox();
		addMsg(`Ok, what is ${partialProduct} - ${intermediateRemainder}?`)
		
		break;

      case 5:
	    //validate third answer digit input
		if(!isValidInput(2))
			break;

		//check if they subtracted right
		var temp = queryBox.value * 1; //The subtracted value at this part in the division.
		
		//= 0 short circuit =
		//Overwrite the temp, since it has to be the partial num.
		if(zeroShortCircuit){
			temp = partialProduct;
		}
		
		//if subtraction was done incorrectly...
		if(temp != partialProduct - intermediateRemainder)
		{
		  addMsg("No. That's not right. Try again.");
			
		  stepCounter -= 1;
		  clearQueryBox();
		  break;
		}

		//NEXT VALIDATION CHECK
	    //So after the subtraction we have a few possibilities:
		// - if the difference is greater than the denominator, they chose the wrong answer (too low), go back 2 steps
		// - if the difference is negative, the chosen answer is too big!
		if(temp >= denominator)
		{
		  addMsg(`The number ${temp} is bigger than or equal the denominator, ${partialQuotent} is too low.`);
		  
		  stepCounter -= 3;
		  clearColumn();
		  digitBoxes[currentCol].classList.add('highlight');
		  clearQueryBox();
		  break;
		}
		else if(temp < 0)
		{
		  addMsg(`${partialQuotent} is too large - get a smaller number.`);
			
		  stepCounter -= 3;
		  clearColumn();
		  digitBoxes[currentCol].classList.add('highlight');
		  clearQueryBox();
		  break;
		}

		// - The answer is correct push forward
		//Update our highlighting.
		unHighlightColumn(currentCol);
		if(partialProduct > 9) unHighlightColumn(currentCol-1); //Go back 1 col if we're a 2 digit number
		if(partialProduct > 99) unHighlightColumn(currentCol-2); //Go back 2 cols if we're a 3 digit number
		var ansBox = 16 + (curAnsRow * 8) + currentCol;
		
		//If we're not doing the 0 shortcircuit, load our selected answer below.
		if(!zeroShortCircuit){
			numStr = "" + temp;
						
			var adjSpace = ansBox - (numStr.length-1);
			for(var i = 0; i < numStr.length; i++){
				digitBoxes[adjSpace+i].innerHTML = numStr[i];
			}
		}

		//Clear messages for next prompt
	    eraseMsg();
	    clearQueryBox();

		
		console.log("github update check!");
			
		/////////////////////////////////////////////////////////////////
		// Remainder Bypass - we're out of numbers or we're on column 3, we're at the remainder step.
		var temp2 = numeratorString[currentCol+1];
		if(isNaN(parseInt(temp2)) || currentCol > 2)
		{
		  addMsg('All right! What is the remainder?');
		  digitBoxes[ansBox].classList.add('remember');
		  if(temp>9) //Highlight the 10s digit
			  digitBoxes[ansBox-1].classList.add('remember');
		  digitBoxes[4].classList.add('highlight');
		  digitBoxes[5].classList.add('highlight');

		  //Put the top level answer in for the 0 bypass
		  if(zeroShortCircuit){
		    numStr = "" + temp;
						
			var adjSpace = ansBox - (numStr.length-1);
			for(var i = 0; i < numStr.length; i++){
				digitBoxes[adjSpace+i].innerHTML = numStr[i];
			}
		  }
			
		  break;
		}
		///////////////////////////////////////////////////////////////////
		// If we have more digits of the denominator to do, move to the next column row, carry down any remaining digit
		currentCol += 1;
		ansBox += 1;
		unHighlightColumn(currentCol);
		partialProduct = numeratorString[currentCol] * 1;
		partialProduct += 10 * temp;
		
		//Not at remainder step, need another 0 shortcircuit check
		if(!zeroShortCircuit){
			digitBoxes[ansBox].innerHTML = digitBoxes[8+currentCol].innerHTML;
			digitBoxes[ansBox].classList.add('remember');
			if(partialProduct > 9)
			  digitBoxes[ansBox-1].classList.add('remember');
		}
		
		//Highlight current 
		digitBoxes[8+currentCol].classList.add('remember');
		
		addMsg(`So... how many times does ${denominator} go into ${partialProduct}?`);
		digitBoxes[currentCol].classList.add('highlight');
		
		//Only update the answer row if we're not 0 bypassing. Othwerwise skip ahead on same row.
		if(zeroShortCircuit)
			zeroShortCircuit = false;
		else
			curAnsRow += 1;
		stepCounter -= 3; //Reset to partial quotient check step!
		console.log(`Step 5, what is my current ans row: ${curAnsRow}`);
		
		break;
  
	  /////////////////////////////////////////////////
	  // Final step, confirm remainder and finish up.
      case 6:
		if(!isValidInput(2))
		  break;
		  
		//If the remainder matches the remainder at the bottom partial sub answer we done!
		var startPnt = 16 + (curAnsRow * 8) + currentCol;
		var getRemainder = digitBoxes[startPnt].innerHTML * 1;
		if(currentCol > 0)
		  getRemainder += digitBoxes[startPnt-1].innerHTML * 10;
		
		console.log(`The expected remainder value is: ${getRemainder}`);
		
		var temp = queryBox.value * 1;
		
		if(getRemainder != temp){
		  addMsg("No. That's not right. Try again.");
			
		  stepCounter -= 1;
		  clearQueryBox();
		  break;
		}
	    
		//Wipe all columns
		unHighlightColumn(0);
		unHighlightColumn(1);
		unHighlightColumn(2);
		unHighlightColumn(3);
		
		//The user input the right answer. Finish it up.
		digitBoxes[0].classList.add('remember');
		digitBoxes[1].classList.add('remember');
		digitBoxes[2].classList.add('remember');
		digitBoxes[3].classList.add('remember');
		digitBoxes[4].classList.add('remember');
		digitBoxes[4].classList.remove('highlight');
		digitBoxes[4].classList.add('remember');
		digitBoxes[5].classList.remove('highlight');
		
		if(getRemainder < 10)
		{
		  digitBoxes[4].innerHTML = getRemainder;
		}
		else
		{
		  digitBoxes[4].innerHTML = parseInt(getRemainder / 10);
		  digitBoxes[5].innerHTML = getRemainder % 10;
		  digitBoxes[5].classList.add('remember');
		}
	  
	    //Final message update.
	    addMsg("Correct! That's the right answer!");
		confirmBtn.innerHTML = "Restart";
		queryBox.style.visibility = "hidden";
	  
	    break;
	
	  /////////////////////////////////////////////////
	  // Final step reset the divider
	  case 7:
	    //Wipe the columns and change the button back
	    clearAllBoxes();
	    confirmBtn.innerHTML = "Confirm";
		
		//Reset all variables
		currentCol = 0;
		curAnsRow = 0;
		numerator = 0;
		numeratorString = "";
		denominator = 0;
		partialProduct = 0;
		partialQuotent = 0;
		intermediateRemainder = 0;
		
		//update message
		eraseMsg();
		addMsg("Press confirm to start again.");
		
	    stepCounter = RESET;
	    break;
	  
    //////////////////////////////////////
    // Should never be here.
      default:
        addMsg("Something went wrong!");
        break;
    }
    
	//Set the input box to focus
	queryBox.focus();
	
	//Incriment step counter at the end.
    stepCounter += 1;
  }
////////////////////////////////////////////////////////////////////////////////////////////
// Utility functions

  function isValidInput(numDigits){
    var inputBox = document.getElementById("queryInput");
    inputBox.value.trim();
  
    //Check if the input is a valid number.
	if(inputBox.value == '' || isNaN(inputBox.value)){
	  stepCounter -= 1;
	  addMsg(inputBox.value + " is not a number. Try again.");
	  inputBox.value = "";
	  inputBox.focus();
	  return false;
	}
	else{
	  var maxValue = ("9".repeat(numDigits)) * 1;
	  
	  //Check if the input is out of bounds
	  if(Math.abs(inputBox.value) < 0 || inputBox.value > maxValue)
	  {
	    stepCounter -= 1;
		inputBox.value = "";
		addMsg("Please put in a number between 0 and "+maxValue);
	  }
	  else
	    return true;
	}
  }
  
  //Adds the confirm button to the message window.
  function toggleConfirmButton(){
	var isHidden = window.getComputedStyle(elem).display === "none";

	if (isHidden) {
	  confirmBtn.style.display = 'none';
	} else {
	  confirmBtn.style.display = 'inline-block';
	}
  }

  function clearQueryBox(){
    queryBox.value = "";
  }
  
  //Outputs a message to the window
  function addMsg(output){
    msgBox.innerHTML += output +  "<br />";
  }
  
  //Clears the output window.
  function eraseMsg(){
    msgBox.innerHTML = "";
  }
  
  function unHighlightColumn(colErase){
	//Answer row
	digitBoxes[colErase].classList.remove('highlight');
	digitBoxes[colErase].classList.remove('remember');
	
	//divisor row - don't erase number.
	digitBoxes[colErase+8].classList.remove('highlight');
	digitBoxes[colErase+8].classList.remove('remember');
	
	//first subrahend row
	digitBoxes[colErase+12].classList.remove('highlight');
	digitBoxes[colErase+12].classList.remove('remember');
	
	//partial sub answer row
	digitBoxes[colErase+16].classList.remove('highlight');
	digitBoxes[colErase+16].classList.remove('remember');
	
	//second subtrahend row
	digitBoxes[colErase+20].classList.remove('highlight');
	digitBoxes[colErase+20].classList.remove('remember');
	
	//third 
	digitBoxes[colErase+24].classList.remove('highlight');
	digitBoxes[colErase+24].classList.remove('remember');
	
	//third 
	digitBoxes[colErase+28].classList.remove('highlight');
	digitBoxes[colErase+28].classList.remove('remember');
	
	digitBoxes[colErase+32].classList.remove('highlight');
	digitBoxes[colErase+32].classList.remove('remember');
	
	digitBoxes[colErase+36].classList.remove('highlight');
	digitBoxes[colErase+36].classList.remove('remember');
	
	digitBoxes[colErase+40].classList.remove('highlight');
	digitBoxes[colErase+40].classList.remove('remember');
  }
  
  function clearColumn(){
	unHighlightColumn(currentCol);
  
	//Answer row
	digitBoxes[currentCol].innerHTML = "";
	
	//first subrahend row
	digitBoxes[currentCol+12].innerHTML = "";
	
	//partial sub answer row
	digitBoxes[currentCol+16].innerHTML = "";
  }
  
  function clearAllBoxes(){
	unHighlightColumn(0);
	unHighlightColumn(1);
	unHighlightColumn(2);
	unHighlightColumn(3);
	
	//Unhighlight all remainder/diviser boxes
	for(var i = 4; i < 8; i ++){
	  digitBoxes[i].classList.remove('highlight');
	  digitBoxes[i].classList.remove('remember');
	}
	
	for(var i = 0; i < digitBoxes.length; i++)
	  digitBoxes[i].innerHTML = "";
  }

//doDivision();



