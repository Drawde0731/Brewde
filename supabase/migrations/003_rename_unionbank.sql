-- Update the payment_method constraint to replace 'unionbank' with 'online_bank'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cash','gcash','maya','online_bank','card'));

-- Migrate any existing orders that used 'unionbank'
UPDATE orders SET payment_method = 'online_bank' WHERE payment_method = 'unionbank';
