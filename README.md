####*GROCERY ECOMMERCE APP*####

#To Run the application follow these steps - 

1. Open 'Ecommerce_App-master' folder in Visual Studio(VS).

2. Open Terminal in VS and execute "npm run install-all". Wait for it to complete.
   (This will install/verify all npm modules for both server and client side)

3. To start the mongodb server, execute "mongod --dbpath "{path}/Ecommerce_App-master/ecommerceDB"".
   Keep this terminal running.
   (path = where you have kept the Ecommerce_App-master Folder on your system)

4. Open another terminal in VS and execute "npm run start-server" to start the backend nodeJS
   server on port 3001. Keep this running too.

5. Open another terminal (3rd) and execute "npm run start-client" to start the React application.

6. A browser tab will open automatically with the application running.

7. Example Account Credentials -
   ID - tushar@gmail.com
   Pass - tushar12345

**HOPE YOU LIKE IT**




#Features of the Application - 

1. All users are able to view products and filter products by title, categories and sort by Price, Category, Quantity In Stock and Title.

2. Unregistered users can view products and begin adding them to cart. This cart data is saved in browser memory currently (cookies) and redux store.

3. Each add, remove product operation is atomic. It reflects in the backend database. Also, I have used SOCKETS to identify each new connection.
   On each product operation across any session, the Stock quantity of the product is updated and reflects across all connections automatically.
   THIS SECURES APPLICATION AND ENABLES PRODUCT RESERVATION FOR EACH USER.

4. When Unregistered user then proceed to cart, they are redirected Sign Up/ Sign In page. They must register themselves to continue further.
   On the top there is a "SWITCH TO SIGN IN" button which can be used to switch between Sign Up and Sign In.

5. Once the user registers or logs in to existing account, LOCAL CART DATA IS AUTOMATICALLY MERGED WITH THEIR CART IN DATABASE and they are redirected directly to Cart.
   This helps user so that they don't have to add products again which they already did while not logged in. Also does not alter existing cart of the user in database.

6. Authentication token is stored in a browser cookie for client side and redux store. Currently I have kept each Authentication session alive for 2hrs.
   After 2hrs, token becomes invalid and the cookie gets deleted on the client side. The token also becomes invalid on the backend automatically after 2 hrs.
   This increases security and consistency and improves user experience on the client side.

7. Logged In User can also edit cart products from Cart Page and also remove a product from cart. The price is updated automatically in the backend and client side.
   Again, each operation is atomic and reflects in the backend and across all client side connections.

8. "PLACE ORDER", button is available to logged in user only when there are products in cart. When user clicks on Place Order, currently the user is redirected to Orders
   Page and a response on top of the page gives the user orderID of the placed order. On this page user can view all orders placed and shipping address for each.
   Orders are sorted by Order Time with most recent at top. There is a "Confirm Delivery" button across each order which on Click sets the order as completed/delivered.

9. User also has access to "My Profile" Page. On this Page user can view their profile picture, and personal details. User can choose new profile picture which is
   saved as buffer in database. User can edit Personal Details by clicking on "Edit Profile" button. On click they will be presented with a form on the right.
   In this form user can edit details such as Name, Age, Address, Contact, Email, Password. Only filled inputs are reflected by the changes and inputs left blank
   do not change anything.

10. Application has been optimized for Big Screen Sizes such as laptops, computers and Mobile devices (max-width=500px). It might not be suited for medium screen sizes yet.

11. No sensitive data is available to the user in frontend like productID or userID or plain text passwords, details of other users etc. Only Cart data and auth token is
    stored in browser. Auth Token is encrypted and valid only for session of 2hrs on client side as well as backend. Cart data only contains product title and quantity,
    which is again validated on the backend for each operation and also price is calculated on the backend and rechecked when the user places a new order.

12. There is also a small button on My Profile page as "Logout All Devices". Clicking this will make all user sessions and tokens invalid across all browsers.


NOTE --> TO ADD MORE PRODUCTS OR ALTER DATABASE EITHER REFER TO SERVER FOLDER "APP_DETAILS.txt" and USE POSTMAN.
	 OR
	 USE Robo 3T or similar application to connect to the backend mongodb database that is running on the terminal.
