var restify = require('restify');
var builder = require('botbuilder');
/********** UI Layer **********/
// Buttons
var YesNoButtons = "YesButton/NoButton/Text";
var SkipHelpButtons = "SkipButton/HelpButton/Text";

// Messages
var GreetingMsg = "<Hindi>Hi there! Thanks for your message. In English, please write all of the soft drinks that you purchased today. See the pictures below for examples.</Hindi>";
var GoodbyeMsg = "<Hindi>Thanks! Goodbye!</Hindi>";
var MoreItemsMsg = "<Hindi>Do you have any more items?</Hindi>";
var WhatElseMsg = "<Hindi>What else did you purchase (please write in English)?</Hindi>";
var NeedHelpMsg = "<Hindi>Do you need help with the formatting?</Hindi>";
var NiceJobMsg = "<Hindi>Nice job!</Hindi>";
var MissingDataMsg = "<Hindi>It appears you may have some missing characteristics in the text you entered.</Hindi>";
var DidNotUnderstandMsg = "<Hindi>I didn't understand that. Can you try sending again?</Hindi>";
var MissBrandMsg = "<Hindi>The brand for at least one of the items is missing.</Hindi>";
var MissPackSizeMsg = "<Hindi>The pack size for at least one of the items is missing.</Hindi>";
var MissPackTypeMsg = "<Hindi>The pack type for at least one of the items is missing.</Hindi>";
var MissQuantityMsg = "<Hindi>The quantity for at least one of the items is missing.</Hindi>";

// Pictures
var ExamplePictureCarousel = "<picture>Example Picture Carousel</picture>";
var ExamplePictureCarouselURL = "C:/Users/messma01/Documents/Consumer Engineering/BotFramework/greetingExamplePic.png";
var SuggestedFixPicture = "<picture>SuggestFixPicture</picture>";
var SuggestedFixPictureBrand = "<picture>SuggestFixPicture-Brand</picture>";
var SuggestedFixPicturePackSize = "<picture>SuggestFixPicture-PackSize</picture>";
var SuggestedFixPicturePackType = "<picture>SuggestFixPicture-PackType</picture>";
var SuggestedFixPictureQuantity = "<picture>SuggestFixPicture-Quantity</picture>";

var MissBrandPic = "C:/Users/messma01/Documents/Consumer Engineering/BotFramework/missingData-Brand.png";
var MissPackSizePic = "C:/Users/messma01/Documents/Consumer Engineering/BotFramework/missingData-PackSize.png";
var MissPackTypePic = "C:/Users/messma01/Documents/Consumer Engineering/BotFramework/missingData-PackType.png";
var MissQuantityPic = "C:/Users/messma01/Documents/Consumer Engineering/BotFramework/missingData-Quantity.png";

// Switch
IS_FIRST_INTERACTION = true;

/********** Data Layer **********/
// Brands
var BrandList = ["coke","pepsi"];
// Pack Sizes
var PackSizeList = ["250ml","2l"];
// Pack Types
var PackTypeList = ["plastic","tetrapack","aluminum"];
// Quantities
var QuantityList = ["one","two","three"];

/********** Data Access Layer **********/
function getPictureUrl(text)
{
	var picUrls = [];
	if (text.includes(ExamplePictureCarousel))
	{
		picUrls.push(ExamplePictureCarouselURL);
	}
	if (text.includes(SuggestedFixPictureBrand))
	{
		picUrls.push(MissBrandPic);
	}
	if (text.includes(SuggestedFixPicturePackType))
	{
		picUrls.push(MissPackSizePic);
	}
	if (text.includes(SuggestedFixPicturePackSize))
	{
		picUrls.push(MissPackTypePic);
	}
	if (text.includes(SuggestedFixPictureQuantity))
	{
		picUrls.push(MissQuantityPic);
	}
	if(picUrls[0])
		return picUrls;
	else
		return 0;
}

/********** Business Layer **********/
GOOD_MSG = 10;
MISSING_BRAND_MSG = 20;
MISSING_PACKSIZE_MSG = 22;
MISSING_PACKTYPE_MSG = 24;
MISSING_QUANTITY_MSG = 26;
BAD_MSG = 30;

BUTTON_CLICK_ENABLED = false;

function cleanMsg(msg)
{
	// replace commas and extra space with single space
	return msg.toLowerCase().replace(',','	').replace(/\s\s+/g, ' ');
}

function CountEntitiesInMessage(msgArr, entityArr)
{
	var count = 0;
	for (var i = 0; i < msgArr.length; i++)
	{
		for (var j = 0; j < entityArr.length; j++)
		{
			if (msgArr[i] == entityArr[j])
			{
				count++;
			}
		}
	}
	return count;
}

function findMax(arr)
{
	var max = 0;
	
	for(var i = 0; i < arr.length; i++)
	{
		if (arr[i] > max)
		{
			max = arr[i];
		}
	}
	return max;
}

function findOutliers(arr, max)
{
	var outliers = [];
	
	for (var i = 0; i < arr.length; i++)
	{
		if (arr[i] < max)
		{
			outliers.push(i); // push the index
		}
	}
	return outliers;
}

function EvaluateTextContents(msg)
{
	var brandInd = 0;
	var packSizeInd = 1;
	var packTypeInd = 2;
	var quantityInd = 3;
	var countsArr = [0,0,0,0];
	
	var msgArr = msg.split(' ');
	var errCodes = [];
	
	// aggregate count of all entities
	countsArr[brandInd] = CountEntitiesInMessage(msgArr, BrandList);
	countsArr[packSizeInd] = CountEntitiesInMessage(msgArr, PackSizeList);
	countsArr[packTypeInd] = CountEntitiesInMessage(msgArr, PackTypeList);
	countsArr[quantityInd] = CountEntitiesInMessage(msgArr, QuantityList);
	
	// find max entity in array and find outliers
	var numProducts = findMax(countsArr);
	console.log("Num products: %d",numProducts);
	var outliers = findOutliers(countsArr, numProducts);
	console.log("Num outliers: %d",outliers.length);
	// if we don't have outliers, we have either no products (bad) or consistently good entities (good)
	if (outliers.length == 0)
	{
		if (numProducts != 0)
		{
			console.log("Returning good message.");
			errCodes.push(GOOD_MSG);
		}
		else
		{
			console.log("Returning bad message.");
			errCodes.push(BAD_MSG);
		}
		return errCodes;
	}
	
	
	
	// return good, missing data array, or bad based on counts
	for (var i = 0; i < outliers.length; i++)
	{
		switch (outliers[i])
		{
			case brandInd:
				errCodes.push(MISSING_BRAND_MSG);
				break;
			case packSizeInd:
				errCodes.push(MISSING_PACKSIZE_MSG);
				break;
			case packTypeInd:
				errCodes.push(MISSING_PACKTYPE_MSG);
				break;
			case quantityInd:
				errCodes.push(MISSING_QUANTITY_MSG);
				break;
			default:
				break;
		}
	}
	console.log("Returning data missing message");
	return errCodes;
}

function CheckForButtonClicks(msg)
{
	console.log("checking for button click");
	if(!BUTTON_CLICK_ENABLED)
	{
		console.log("button click disabled");
		return 0;
	}
	switch (msg)
	{
		case "yes":
			BUTTON_CLICK_ENABLED = false;
			return WhatElseMsg;
			break;
		case "no":
			BUTTON_CLICK_ENABLED = false;
			IS_FIRST_INTERACTION = true;
			return GoodbyeMsg;
			break;
		case "skip":
			BUTTON_CLICK_ENABLED = true;
			return MoreItemsMsg;
			break;
		case "help":
			BUTTON_CLICK_ENABLED = false;
			return ExamplePictureCarousel;
			break;
		default:
			return 0;
	}
}

/********** Application Layer **********/
function HandleMessage(msg)
{
	// clean up
	msg = cleanMsg(msg);
	
	// check if it's a "button click"
	var buttonClickResp = CheckForButtonClicks(msg);
	if(buttonClickResp != 0)
	{
		console.log("button click determined: %d",buttonClickResp);
		return buttonClickResp;
	}
	// otherwise, do the text evaluation
	else {
		var errMsg = MissingDataMsg;
		var errorCodes = EvaluateTextContents(msg);
		console.log("length of error codes: %d",errorCodes.length);
		// string of if statements (not if else) for error codes
		for(var i = 0; i < errorCodes.length; i++)
		{
			console.log("Error codes of %d: %d", i, errorCodes[i] );
			if(errorCodes[i] == GOOD_MSG)
			{
				BUTTON_CLICK_ENABLED = true;
				return NiceJobMsg + MoreItemsMsg + YesNoButtons;
			}
			if(errorCodes[i] == MISSING_BRAND_MSG)
			{
				errMsg += MissBrandMsg;
				errMsg += SuggestedFixPictureBrand;
			}
			if(errorCodes[i] == MISSING_PACKSIZE_MSG)
			{
				errMsg += MissPackSizeMsg;
				errMsg += SuggestedFixPicturePackSize;
			}
			if(errorCodes[i] == MISSING_PACKTYPE_MSG)
			{
				errMsg += MissPackTypeMsg;
				errMsg += SuggestedFixPicturePackType;
			}
			if(errorCodes[i] == MISSING_QUANTITY_MSG)
			{
				errMsg += MissQuantityMsg;
				errMsg += SuggestedFixPictureQuantity;
			}
			if(errorCodes[i] == BAD_MSG)
			{
				BUTTON_CLICK_ENABLED = true;
				return DidNotUnderstandMsg + NeedHelpMsg + SkipHelpButtons;
			}
		}
		BUTTON_CLICK_ENABLED = true;
		//errMsg += SuggestedFixPicture + SkipHelpButtons;
		errMsg += SkipHelpButtons;
		return errMsg;
	}
}

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Dialogs
//=========================================================



bot.dialog('/', [
	function (session) {
		var msgText;
		if (IS_FIRST_INTERACTION)
		{
			msgText = GreetingMsg + ExamplePictureCarousel;
			IS_FIRST_INTERACTION = false;
		}
		else 
		{
			msgText = HandleMessage(session.message.text); 
		}
		//session.send(msgText);
		
		// add any pictures
		var picUrls = getPictureUrl(msgText);
		
		// add any buttons
		var msgCard = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.ThumbnailCard(session)
                    //.title("Test Card")
                    //.subtitle("Test Card")
                    .text(msgText)
					//.text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, picUrls[0])
                    ])
                    //.tap()
            ]);
        session.send(msgCard);
		
	}
]);
