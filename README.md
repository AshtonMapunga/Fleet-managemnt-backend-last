# Fleet Management API Cheatsheet

## Vehicle Routes (`/api/vehicle`)
- **POST `/create`**: Add new vehicle. Data: vehicle object.
- **GET `/getVehicles`**: Get all vehicles. Data: array of vehicles.
- **GET `/vehicles-with-location`**: Get all vehicles with location and driver info. Data: array of vehicles (with location, driver).
- **GET `/vehicle-with-location/:vehicleReg`**: Get vehicle by registration with location and driver info. Data: vehicle object.
- **GET `/getVehiclesByDepartment`**: Get vehicles by department. Data: array of vehicles.
- **GET `/`**: Get vehicle by registration (query param). Data: vehicle object.
- **PUT `/update-details/:vehicleReg`**: Update vehicle details. Data: updated vehicle object.
- **POST `/cartrack/batch-create-vehicles`**: Batch add vehicles from Cartrack. Data: array of created vehicles.
- **PUT `/update-tracking/:vehicleReg`**: Update vehicle tracking details. Data: updated vehicle object.
- **GET `/status/:status`**: Get vehicles by status. Data: array of vehicles.

## Driver Booking Routes (`/api/driver-booking`)
- **POST `/create`**: Book a driver. Data: booking object.
- **GET `/getAllDriverBookings`**: Get all driver bookings. Data: array of bookings.
- **GET `/getBookingsByDriver`**: Get bookings by driver ID. Data: array of bookings.
- **GET `/getDriverRequests`**: Get driver requests. Data: array of requests.

## Maintenance Routes (`/api/maintenance`)
- **POST `/create`**: Record maintenance. Data: maintenance object.
- **GET `/`**: Get all maintenance records. Data: array of maintenance records.
- **GET `/vehicle`**: Get maintenance by vehicle ID. Data: array of maintenance records.
- **PUT `/editMaintenance`**: Edit maintenance record. Data: updated maintenance object.

## Cost Management Routes (`/api/cost-management`)
- **POST `/create`**: Record cost. Data: cost object.
- **GET `/getAllCosts`**: Get all costs. Data: array of costs.
- **GET `/getCostsByDepartment`**: Get costs by department. Data: array of costs.
- **GET `/getCostsByCategory`**: Get costs by category. Data: array of costs.
- **GET `/getCostsByAssociatedVihicle`**: Get costs by related vehicle. Data: array of costs.

## Department Routes (`/api/departments`)
- **POST `/addDepartment`**: Create department. Data: department object.
- **GET `/all-departments`**: Get all departments. Data: array of departments.
- **PUT `/updateBudget`**: Update department budget. Data: updated department object.
- **GET `/getBudget`**: Get department budget. Data: budget info.
- **PUT `/editDepartment`**: Edit department. Data: updated department object.
- **PUT `/deductFunds`**: Deduct funds from department. Data: updated department object.

## Subsidiary Routes (`/api/subsidiary`)
- **POST `/create-subsidiary`**: Create subsidiary. Data: subsidiary object.

## Accident Routes (`/api/accidents`)
- **POST `/createAccident`**: Record accident. Data: accident object.
- **GET `/allAccidents`**: Get all accidents. Data: array of accidents.

## User Routes (`/api/user`)
- **POST `/create-user`**: Create user. Data: user object.
- **POST `/create-driver`**: Create driver. Data: driver object.
- **POST `/batch-create-users`**: Batch add users. Data: array of users.
- **POST `/batch-create-drivers`**: Batch add drivers. Data: array of drivers.
- **GET `/get-users`**: Get all users. Data: array of users.
- **POST `/all-drivers`**: Get all drivers. Data: array of drivers.
- **GET `/get-user/:id`**: Get user by ID. Data: user object.
- **GET `/department-drivers/:departmentId`**: Get drivers by department. Data: array of drivers.
- **POST `/cartrack/batch-create-drivers`**: Batch add drivers from Cartrack. Data: array of drivers.
- **GET `/getUserByEmail`**: Get user by email. Data: user object.
- **PUT `/update-roles/:id`**: Update user roles. Data: updated user object.
- **GET `/role/:role`**: Get users by role. Data: array of users.
