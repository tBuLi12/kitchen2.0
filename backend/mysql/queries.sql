select dish_id, name, last_made from dishes where user_id = %s order by last_made

update dishes set last_made = sysdate() where dish_id = %s and user_id = %s

insert into users (username, passhash) values (%s, %s)

select user_id, passhash from users where username=%s

insert into dishes (name, last_made, user_id) values (%s, sysdate(), %s)

select list_item_id, name, quantity, unit, checked from lists where user_id = %s

insert into lists (name, quantity, unit, user_id) values (%s, %s, %s, %s)

update lists set checked = if (checked, false, true) where list_item_id = %s
