
class RegistrationPolicy < ApplicationPolicy
  def create?
    true
  end

  def update?
    record.event.manager == user || record.event.venue.manager == user || user.administrator?
  end
end
