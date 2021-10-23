import challenge from "../challenge.js";
import { generateOneTimeCode, getExpirationLength } from "../../../lib/security/oneTimeCode.js";
import { oneTimeCodesService } from "../../../services/mongodb/index.js";
import { sendOneTimeCodeVerification } from "../../../lib/verification/index.js";
import { ObjectId } from "mongodb";
import { v4 as generateGuid } from "uuid";

jest.mock("../../../lib/security/oneTimeCode.js", () => ({
   ...jest.requireActual("../../../lib/security/oneTimeCode.js"),
   generateOneTimeCode: jest.fn()
}));
jest.mock("../../../services/mongodb/index.js");
jest.mock("../../../lib/verification/index.js");

let req;
let res;
let error;
let key;
let code;
let expires;

describe("Challenge controller invalid inputs", () => {
   beforeEach(() => {
      req = {
         body: {},
         logger: {
            info: jest.fn(),
            error: jest.fn()
         }
      };
      res = {
         json: jest.fn(),
         send: jest.fn()
      };
      error = null;
      key = generateGuid();
      code = "123456";
      expires = getExpirationLength();
   });

   afterEach(() => {
      jest.unmock("../../../services/mongodb/index.js");
   });

   test("Missing userIdentifier", async () => {
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });

   test("Null userIdentifier", async () => {
      req.body = {
         email: null
      };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });
   
   test("Blank userIdentifier", async () => {
      req.body = { userIdentifier: "" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });
   
   test("Invalid email", async () => {
      req.body = { userIdentifier: "@charlie.gmail.com" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });

   test("Email with only spaces", async () => {
      req.body = { userIdentifier: "       @           " };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });

   test("Phone number with only spaces", async () => {
      req.body = { userIdentifier: "                  " };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });   

   test("Email with spaces", async () => {
      req.body = { userIdentifier: "      CEDOMIR.SPALEVIC@GMAIL.COM         " };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(res.send).not.toHaveBeenCalled();
         expect(error).toBeTruthy();
      }
   });
});

describe("Challenge controller valid inputs", () => {
   beforeEach(() => {
      req = {
         body: {
            userIdentifier: ""
         }, 
         logger: {
            info: jest.fn(),
            error: jest.fn()
         }
      };
      res = {
         json: jest.fn(),
         send: jest.fn()
      };
      error = null;
      key = generateGuid();
      code = "123456";
      expires = getExpirationLength();
      generateOneTimeCode.mockImplementation(() => ({
         userIdentifier: req.body.userIdentifier,
         key,
         code,
         expiresOn: Date.now()
      }));
      oneTimeCodesService.mockImplementation(() => Promise.resolve({
         create: async () => Promise.resolve({
            _id: ObjectId(),
            modifiedOn: new Date(),
            createdOn: new Date(),
            code,
            key
         })
      }));
      sendOneTimeCodeVerification.mockImplementation(() => Promise.resolve({}));
   });

   test("All caps email", async () => {
      req.body = { userIdentifier: "CEDOMIR.SPALEVIC@GMAIL.COM" };
      try {
         await challenge(req, res);
      }
      finally {
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "email"
         });
      }
   });

   test("Valid phone number", async () => {
      req.body = { userIdentifier: "6309152350" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "phone"
         });
      }
   });

   
   test("Valid phone number", async () => {
      req.body = { userIdentifier: "(630) 915-2350" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "phone"
         });
      }
   });

   test("Valid phone number", async () => {
      req.body = { userIdentifier: "1 630 915 2350" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "phone"
         });
      }
   });
   
   test("Valid phone number", async () => {
      req.body = { userIdentifier: "16309152350" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "phone"
         });
      }
   });

   test("Valid phone number", async () => {
      req.body = { userIdentifier: "+16309152350" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "phone"
         });
      }
   });

   test("Valid email", async () => {
      req.body = { userIdentifier: "charlie.spalevic@gmail.com" };
      try {
         await challenge(req, res);
      }
      catch(e) {
         error = e;
      }
      finally {
         expect(error).toBeFalsy();
         expect(res.json).toHaveBeenCalledTimes(1);
         expect(res.json).toHaveBeenCalledWith({
            key,
            expires,
            type: "email"
         });
      }
   });
});