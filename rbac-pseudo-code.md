# RBAC Psuedo-code

![alt text](<User RBAC ERD.png>)

## Role Permission Enum
```
permission_action {
  create
  read
  update
  delete
}
```

## Permission Resource Lookup Table
```
permission_resource {
  users
  vessels
  role_assignments
  work_orders
  vessel_assignments
  work_order_assignments
}
```

## Rough Psuedo code of accessing it in a service
```rust
let user = User(...)
if(user.is_permitted_to(permission_action::create, permission_resource::vessels)) {
  // then create a vessel
}
```

## Admin
- The Admin must be able to **create** new **vessels** or ships
```
user_role_permission {
  user_role_id: <role_id_of_admin>
  resource: vessel
  action: permission_action.create
}
```

- The Admin must be able to **create** new **users**
```
user_role_permission {
  user_role_id: <role_id_of_admin>
  resource: users
  action: permission_action.create
}
```
- and **assign** them **roles** (Captain or Crew).
```
user_role_permission {
  user_role_id: <role_id_of_admin>
  resource: role_assignments
  action: permission_action.update
}
```
- The Admin must be able to **link/assign** new members to specific **vessel**.
```
user_role_permission {
  user_role_id: <role_id_of_admin>
  resource: vessel_assignments
  action: permission_action.update
}
```

## Captain

- Captains can **create** a **work order** for a specific vessel and

```
user_role_permission {
  user_role_id: <role_id_of_captain>
  resource: work_orders
  action: permission_action.create
}
```

- **assign** it to an available Crew member under their command. The initial status is Open.
```
user_role_permission {
  user_role_id: <role_id_of_captain>
  resource: work_order_assignments
  action: permission_action.update
}
```

- Captains **review** the **work order** once marked Done and
```
user_role_permission {
  user_role_id: <role_id_of_captain>
  resource: work_orders
  action: permission_action.read
}
```
- can either **Attest** (fully close/approve the record) or Reject (send it back to assigned crew with a required rejection reason/comment).
```
user_role_permission {
  user_role_id: <role_id_of_captain>
  resource: work_orders
  action: permission_action.update
}
```


## Crew

- Crew members can **view** their **assigned work orders**
```
user_role_permission {
  user_role_id: <role_id_of_crew>
  resource: work_order_assignments
  action: permission_action.read
}
```

**update** the status to In Progress, document the Solution, and mark it as Done.
```
user_role_permission {
  user_role_id: <role_id_of_crew>
  resource: work_order_assignments
  action: permission_action.update
}
```
